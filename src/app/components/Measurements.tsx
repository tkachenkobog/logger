"use client";

import { Field, Formik, FormikProps } from "formik";
import { JSX, useState, useEffect, useRef } from "react";
import { DateValueType } from "react-tailwindcss-datepicker";
import dynamic from "next/dynamic";
import dayjs, { Dayjs } from "dayjs";
import * as echarts from "echarts";
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration';
import { createMeasurements, getMeasurementsData } from "@/app/components/actions/measurements";

dayjs.extend(duration);
dayjs.extend(customParseFormat)

const Datepicker = dynamic(
		() => import('react-tailwindcss-datepicker'),
		{ ssr: false }
);

export default function Measurements (props) {
	const [showGraph2, setShowGraph] = useState<boolean>(false);
	const [value, setValue] = useState<DateValueType>({
		startDate: null,
		endDate: null,
	});
	const [selectedChartOption, setSelectedChartOption] = useState("weight");
	const todayDefault = dayjs().format("YYYY-MM-DD");
	const chartRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!chartRef.current) return;
		
		const chart = echarts.init(chartRef.current);
		
		if (!Array.isArray(props.measurementsData) || props.measurementsData.length === 0) {
			chart.clear();
			return;
		}
		
		const dates = props.measurementsData.map(item => dayjs(item.selected_date).format('ddd'));
		
		let option;
		
		if (selectedChartOption === "weight") {
			const weights = props.measurementsData.map(item => parseFloat(item.weight));
			option = {
				title: {
					text: 'Weight Over Time'
				},
				tooltip: {
					trigger: 'axis'
				},
				xAxis: {
					type: 'category',
					data: dates
				},
				yAxis: {
					type: 'value',
					name: 'Weight',
					min: 66,
					axisLabel: {
						formatter: '{value} kg',
						margin: 10
					}
				},
				series: [
					{
						name: 'Weight',
						type: 'line',
						data: weights,
						markPoint: {
							data: [
								{ type: 'max', name: 'Max' },
								{ type: 'min', name: 'Min' }
							]
						},
					}
				]
			};
		} else if (selectedChartOption === "measurements") {
			const measurementsData = {
				shoulders_cm: props.measurementsData.map(item => parseFloat(item.shoulders_cm) || null),
				chest_cm: props.measurementsData.map(item => parseFloat(item.chest_cm) || null),
				waist_cm: props.measurementsData.map(item => parseFloat(item.waist_cm) || null),
				forearms_cm: props.measurementsData.map(item => parseFloat(item.forearms_cm) || null),
				biceps_cm: props.measurementsData.map(item => parseFloat(item.biceps_cm) || null),
				thighs_cm: props.measurementsData.map(item => parseFloat(item.thighs_cm) || null),
				quadriceps_cm: props.measurementsData.map(item => parseFloat(item.quadriceps_cm) || null),
				calves_cm: props.measurementsData.map(item => parseFloat(item.calves_cm) || null),
			};
			
			option = {
				title: {
					text: 'Measurements Over Time'
				},
				tooltip: {
					trigger: 'axis'
				},
				xAxis: {
					type: 'category',
					data: dates
				},
				yAxis: {
					type: 'value',
					name: 'Centimeters',
					min: 20,
					axisLabel: {
						formatter: '{value} cm',
						margin: 10
					}
				},
				series: [
					{
						name: 'Shoulders',
						type: 'line',
						data: measurementsData.shoulders_cm,
					},
					{
						name: 'Chest',
						type: 'line',
						data: measurementsData.chest_cm,
					},
					{
						name: 'Waist',
						type: 'line',
						data: measurementsData.waist_cm,
					},
					{
						name: 'Forearms',
						type: 'line',
						data: measurementsData.forearms_cm,
					},
					{
						name: 'Biceps',
						type: 'line',
						data: measurementsData.biceps_cm,
					},
					{
						name: 'Thighs',
						type: 'line',
						data: measurementsData.thighs_cm,
					},
					{
						name: 'Quadriceps',
						type: 'line',
						data: measurementsData.quadriceps_cm,
					},
					{
						name: 'Calves',
						type: 'line',
						data: measurementsData.calves_cm,
					},
				],
			};
		}
		
		chart.setOption(option);
		
		return () => {
			chart.dispose();
		};
	}, [props.measurementsData, selectedChartOption]);
	
	
	return (
			<div className="container max-w-md mx-auto border rounded-lg p-4">
				<select
						value={selectedChartOption}
						onChange={(e) => setSelectedChartOption(e.target.value)}
						className="w-full mb-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value="weight">Вага</option>
					<option value="measurements">Охвати</option>
				</select>
				<div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
				<div
						className={ `
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${ showGraph2 ? 'max-h-[1500px] opacity-100 overflow-visible' : 'max-h-0 opacity-0' }
                ` }
				>
					<Formik
							initialValues={ {
								selectedDate: todayDefault,
								weight: "",
								shoulders_cm: "",
								chest_cm: "",
								waist_cm: "",
								forearms_cm: "",
								biceps_cm: "",
								thighs_cm: "",
								quadriceps_cm: "",
								calves_cm: ""
							} }
							onSubmit={ async (values) => {
								await createMeasurements(values);
							} }
					>
						{ (props: FormikProps<{
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
						}>): JSX.Element => (
								<form onSubmit={ props.handleSubmit } className="container max-w-4xl mx-auto py-4">
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
												name="weight"
												type="number"
												placeholder="Weight"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="shoulders_cm"
												type="number"
												placeholder="Shoulders cm"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<Field
												name="chest_cm"
												type="number"
												placeholder="Chest cm"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="waist_cm"
												type="number"
												placeholder="Waist cm(талія)"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<Field
												name="forearms_cm"
												type="number"
												placeholder="Forearms cm"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="biceps_cm"
												type="number"
												placeholder="Biceps cm"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<Field
												name="thighs_cm"
												type="number"
												placeholder="Thighs cm(стегна)"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
										<Field
												name="quadriceps_cm"
												type="number"
												placeholder="Quadriceps cm"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10"
										/>
										<Field
												name="calves_cm"
												type="number"
												placeholder="Calves cm(гомілки)"
												className="w-28 rounded-lg text-center bg-[#1E293B] text-white h-10 justify-self-end"
										/>
									</div>
									<button type="submit"
									        className="bg-amber-50 text-black w-28 h-10 my-2 rounded-lg">Submit
									</button>
								</form>
						) }
					</Formik>
				</div>
				<button className="w-full border" onClick={ () => setShowGraph(!showGraph2) }>Logg Data</button>
			</div>
	);
	
	
}