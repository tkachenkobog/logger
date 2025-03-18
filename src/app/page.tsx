import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Login from "@/app/components/Login";
import Menu from "@/app/components/Menu";
import Sleep from "@/app/components/Sleep";

export default async function Home () {
	const session = await getServerSession(authOptions);
	console.log(session);
	
	return (
			<>
				<header className="flex justify-center fixed top-0 left-0 right-0 z-50 shadow">
					<Menu userSession={ session }/>
				</header>
				<main className="grid grid-cols-3 pt-14 gap-2">
					{ session ? (
							<>
								<Sleep/>
								<div className="border h-[250px] w-[430px]"></div>
								<div className="border h-[250px] w-[430px]"></div>
								<div className="border h-[250px] w-[430px]"></div>
								<div className="border h-[250px] w-[430px]"></div>
								<div className="border h-[250px] w-[430px]"></div>
								<div className="border h-[250px] w-[430px]"></div>
							</>
							
					) : (
							<Login/>
					) }
				</main>
			</>
	);
}
