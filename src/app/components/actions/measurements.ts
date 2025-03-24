"use server"

import { Pool } from "pg";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function createMeasurements (values: {
	selectedDate: string | null;
	weight: "",
	shoulders_cm: "",
	chest_cm: "",
	waist_cm: "",
	forearms_cm: "",
	biceps_cm: "",
	thighs_cm: "",
	quadriceps_cm: "",
	calves_cm: ""
}) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.uuid) {
			throw new Error("Unauthorized access. Please log in.");
		}
		const userId = session.user.uuid;
		const measurementsId = uuidv4();
		
		const result = await pool.query(
				`INSERT INTO measurements (
                measurements_id,
                user_id,
                weight,
                shoulders_cm,
                chest_cm,
                waist_cm,
				forearms_cm,
				biceps_cm,
				thighs_cm,
				quadriceps_cm,
				calves_cm,
				selected_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
				[
					measurementsId,
					userId,
					values.weight,
					values.shoulders_cm || null,
					values.chest_cm || null,
					values.waist_cm || null,
					values.forearms_cm || null,
					values.biceps_cm || null,
					values.thighs_cm || null,
					values.quadriceps_cm || null,
					values.calves_cm || null,
					values.selectedDate
				]
		);
		
		return { success: true, data: result.rows[0] };
	} catch (error) {
		console.error("Error creating measurements record:", error);
		return { success: false, error: (error as Error).message };
	}
}

export async function getMeasurementsData(days: number) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.uuid) {
			throw new Error("Unauthorized access. Please log in.");
		}
		const user_id = session.user.uuid;
		
		const endDate = dayjs();
		const startDate = endDate.subtract(days, 'days');
		
		const result = await pool.query(
				`SELECT * FROM measurements
              WHERE user_id = $1 AND selected_date >= $2 AND selected_date <= $3
              ORDER BY selected_date ASC
             `,
				[user_id, startDate.toISOString(), endDate.toISOString()]
		);
		return result.rows ;
	} catch (error) {
		console.error("Error fetching sleep data:", error);
		return { success: false, error: (error as Error).message };
	}
}