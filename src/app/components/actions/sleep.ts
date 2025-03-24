"use server"

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Pool } from 'pg';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
dayjs.extend(customParseFormat)

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function createSleep(values: {
	deepSleepDuration: "";
	quality: "";
	bpm: "";
	feeling: "";
	ventilated: boolean;
	soloSleep: boolean;
	sober: boolean;
	sleepScore: string;
	selectedDate: string | null;
	startTime: string;
	endTime: string;
	awake: string;
}) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.uuid) {
			throw new Error("Unauthorized access. Please log in.");
		}
		const userid = session.user.uuid;
		
		let selectedDatePostgres = null;
		
		if (values.selectedDate) {
			selectedDatePostgres = new Date(values.selectedDate);
		}
		
		const calculateTimeDifferenc = (startTime, endTime) => {
			try {
				const start = dayjs(startTime, 'HH:mm');
				const end = dayjs(endTime, 'HH:mm');
				
				if (!start.isValid() || !end.isValid()) {
					return null;
				}
				
				const diff = dayjs.duration(end.diff(start));
				const hours = diff.hours().toString().padStart(2, '0');
				const minutes = diff.minutes().toString().padStart(2, '0');
				
				return `${hours}:${minutes}`;
			} catch (error) {
				return null;
			}
		}
		
		
		const sleepid = uuidv4();
		const result = await pool.query(
				`INSERT INTO sleep (
                sleepid,
                userid,
                selectedDate,
                startTime,
                endTime,
                deepSleepDuration,
                quality,
                bpm,
                feeling,
                ventilated,
                soloSleep,
                sober,
                sleepScore,
                sleepDuration,
                awake
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
				[
					sleepid,
					userid,
					selectedDatePostgres,
					values.startTime,
					values.endTime,
					values.deepSleepDuration === "" ? null : values.deepSleepDuration,
					values.quality === "" ? null : values.quality,
					values.bpm === "" ? null : values.bpm,
					values.feeling || null,
					values.ventilated || false,
					values.soloSleep || false,
					values.sober || true,
					values.sleepScore === "" ? null : values.sleepScore,
					calculateTimeDifferenc(values.startTime, values.endTime),
					values.awake
				]
		);
		
		return { success: true, data: result.rows[0] };
	} catch (error) {
		console.error("Error creating sleep record:", error);
		return { success: false, error: (error as Error).message };
	}
}

export async function getSleepDataForLastNDays(days: number) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.uuid) {
			throw new Error("Unauthorized access. Please log in.");
		}
		const userid = session.user.uuid;
		
		const endDate = dayjs();
		const startDate = endDate.subtract(days, 'days');
		
		const result = await pool.query(
				`SELECT * FROM sleep
             WHERE userid = $1
             AND selectedDate >= $2
             AND selectedDate <= $3
             ORDER BY selectedDate ASC`,
				[userid, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
		);
		return result.rows ;
	} catch (error) {
		console.error("Error fetching sleep data:", error);
		return { success: false, error: (error as Error).message };
	}
}
