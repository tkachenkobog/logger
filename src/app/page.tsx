import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Login from "@/app/components/Login";
import Menu from "@/app/components/Menu";
import Sleep from "@/app/components/Sleep";
import { getSleepDataForLastNDays } from "@/app/components/actions/sleep";
import Measurements from "@/app/components/Measurements";
import { getMeasurementsData } from "@/app/components/actions/measurements";

export default async function Home () {
	const session = await getServerSession(authOptions);
	const sleepData = await getSleepDataForLastNDays(8);
	const measurementsData = await getMeasurementsData(7);
	
	return (
			<>
				<header className="flex justify-center fixed top-0 left-0 right-0 z-50 shadow">
					<Menu userSession={ session }/>
				</header>
				<main className="grid grid-cols-2 pt-14 gap-2">
					{ session ? (
							<>
								<Sleep sleepData={sleepData}/>
								<Measurements measurementsData={measurementsData}/>
							</>
							
					) : (
							<Login/>
					) }
				</main>
			</>
	);
}
