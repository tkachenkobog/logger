"use client";

import { createSleep, getSleepDataForLastNDays } from "@/app/components/actions/sleep";
import { Field, Formik, FormikProps } from "formik";
import { JSX, useState, useEffect, useRef } from "react";
import { DateValueType } from "react-tailwindcss-datepicker";
import dynamic from "next/dynamic";
import dayjs, { Dayjs } from "dayjs";
import * as echarts from "echarts";
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
dayjs.extend(customParseFormat)

const Datepicker = dynamic(
		() => import('react-tailwindcss-datepicker'),
		{ ssr: false }
);

export default function Sleep (props) {
	const [showGraph, setShowGraph] = useState<boolean>(false);
	const [value, setValue] = useState<DateValueType>({
		startDate: null,
		endDate: null,
	});
	const todayDefault = dayjs().format("YYYY-MM-DD");
	const chartRef = useRef<HTMLDivElement>(null);
	const [selectedDataOption, setSelectedDataOption] = useState("sleep");
	
	useEffect(() => {
		if (!chartRef.current) return;
		
		const chart = echarts.init(chartRef.current);
		
		if (!Array.isArray(props.sleepData) || props.sleepData.length === 0) {
			chart.clear();
			return;
		}
		
		const processedData = props.sleepData.map(item => {
			const dayOfWeek = dayjs(item.selecteddate).format('ddd');
			const date = item.selecteddate;
			const deepSleepHours = item.deepsleepduration || 0;
			const awakeHours = item.awake || 0;
			
			const sober = item.sober;
			const alone = item.solosleep;
			const ventilated = item.ventilated;
			
			const [hours, minutes] = (item.sleepduration || '0:0').split(':').map(Number);
			const totalSleepHours = hours + minutes / 60;
			const otherSleepHours = totalSleepHours - deepSleepHours - awakeHours;
			
			return {
				dayOfWeek,
				deepSleepHours,
				awakeHours,
				totalSleepHours,
				otherSleepHours,
				sober,
				alone,
				ventilated,
				date
			};
		});
		
		const daysOfWeek = processedData.map(item => item.dayOfWeek);
		const deepSleepHours = processedData.map(item => item.deepSleepHours);
		const awakeHours = processedData.map(item => item.awakeHours);
		const otherSleepHours = processedData.map(item => item.otherSleepHours);
		
		
		
		const option = {
			xAxis: { type: 'category', data: daysOfWeek },
			yAxis: { type: 'value' },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params) => {
					const item = processedData[params[0].dataIndex];
					return `
                    ${dayjs(item.date).format('YYYY-MM-DD')} (${item.dayOfWeek})<br/>
                    Total Sleep: ${item.totalSleepHours}<br/>
                    Deep Sleep: ${item.deepSleepHours} hours<br/>
                    Awake: ${item.awakeHours} hours<br/>
                    Sober: ${item.sober}<br/>
                    Ventilated: ${item.ventilated}<br/>
                    Ventilated: ${item.ventilated}<br/>
                    Sleep Alone: ${item.alone}
                `;
				}
			},
			series: [
				{
					name: 'Deep Sleep',
					type: 'bar',
					stack: 'total',
					data: deepSleepHours,
				},
				{
					name: 'Awake',
					type: 'bar',
					stack: 'total',
					data: awakeHours,
				},
				{
					name: 'Other Sleep',
					type: 'bar',
					stack: 'total',
					data: otherSleepHours,
				}
			]
		};
		
		chart.setOption(option);

		return () => {
			chart.dispose();
		};
	}, [props.sleepData]);
	
	
	return (
			<div className="container max-w-sm mx-auto border rounded-lg p-4">
				<select
						value={selectedDataOption}
						onChange={(e) => setSelectedDataOption(e.target.value)}
				>
					<option value="sleep">Sleep Duration</option>
					<option value="deepSleep">Deep Sleep Duration</option>
				</select>
				<div ref={ chartRef } style={ { width: '100%', height: '300px' } }></div>
				
				<div
						className={ `
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${ showGraph ? 'max-h-[1500px] opacity-100 overflow-visible' : 'max-h-0 opacity-0' }
                ` }
				>
					<Formik
							initialValues={ {
								deepSleepDuration: "",
								quality: "",
								bpm: "",
								feeling: "",
								sleepScore: "5",
								selectedDate: todayDefault,
								sober: false,
								startTime: "",
								endTime: "",
								ventilated: false,
								soloSleep: false,
								awake: ""
							} }
							onSubmit={ async (values) => {
								// calculateTimeDifferenc(values.startTime, values.endTime)
								await createSleep(values);
							} }
					>
						{ (props: FormikProps<{
							deepSleepDuration: "";
							sober: boolean;
							ventilated: boolean;
							soloSleep: boolean;
							selectedDate: string | null;
							sleepScore: string;
							feeling: "";
							quality: "";
							bpm: ""
							startTime: "";
							endTime: "";
							awake: string;
						}>): JSX.Element => (
								<form onSubmit={ props.handleSubmit } className="container max-w-4xl mx-auto py-4">
									<div className="flex flex-col w-full items-center">
										<Field
												name="sleepScore"
												type="range"
												min="0"
												max="10"
												step="1"
												placeholder="Score"
												className="w-full rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<span>Sleep Score: { props.values.sleepScore }</span>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<Datepicker
												useRange={ false }
												asSingle={ true }
												value={ value }
												popoverDirection="up"
												containerClassName="relative w-28"
												placeholder="Today"
												onChange={ (newValue) => {
													setValue(newValue);
													props.setFieldValue(
															"selectedDate",
															newValue.startDate ? dayjs(newValue.startDate).toISOString() : null
													);
												} }
										/>
										<Field
												name="quality"
												type="number"
												placeholder="Quality"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="deepSleepDuration"
												type="number"
												placeholder="   Deep Sleep"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<Field
												name="awake"
												type="number"
												placeholder="Awake"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="bpm"
												type="number"
												placeholder="    Avg. BPM"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
									</div>
									<div className="grid grid-cols-2 py-2">
										<Field
												name="startTime"
												type="time"
												id="startTime"
												className="w-28 rounded-lg text-center bg-[#1E293B] h-10"
										/>
										<Field
												name="endTime"
												type="time"
												id="endTime"
												className="w-28 rounded-lg text-center bg-[#1E293B] h-10 justify-self-end"
										/>
									</div>
									<div className="grid grid-cols-1">
										<div>
											<label className="flex items-center">
												<Field type="checkbox" name="soloSleep" className="mr-2"/>
												Solo sleep
											</label>
										</div>
										<div>
											<label className="flex">
												<Field type="checkbox" name="sober" className="mr-2"/>
												Sober
											</label>
										</div>
										<div>
											<label className="flex items-center">
												<Field type="checkbox" name="ventilated" className="mr-2"/>
												Ventilated before sleep
											</label>
										</div>
									</div>
									<Field
											type="textarea"
											name="feeling"
											placeholder="Fealing of this sleep"
											className="w-full h-49 rounded-lg bg-[#1E293B] p-2 my-2"
									/>
									<button type="submit"
									        className="bg-amber-50 text-black w-28 h-10 my-2 rounded-lg">Submit
									</button>
								</form>
						) }
					</Formik>
				</div>
				<button className="w-full border" onClick={ () => setShowGraph(!showGraph) }>Logg Data</button>
			</div>
	);
	
	
}