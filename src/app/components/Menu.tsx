"use client";

import { signOut } from "next-auth/react";

export default function Menu({ userSession }) {
	console.log(userSession);
	return (
			<div className="w-full">
				{userSession ? (
						<nav className="w-full flex flex-row gap-5 p-2 border-b border-gray-500">
							<ul className="flex flex-row gap-5 w-full justify-center">
								<li>{userSession.user?.name}</li>
								<li>{userSession.user?.uuid}</li>
								<li>
									<button
											className="border border-gray-500"
											onClick={() => signOut()}
									>
										Logout
									</button>
								</li>
								<li>About</li>
								<li>How it's work</li>
							</ul>
						</nav>
				) : (
						<p>You are not logged in.</p>
				)}
			</div>
	);
}
