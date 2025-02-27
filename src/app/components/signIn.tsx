"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
	const { data: session } = useSession();
	
	if (session) {
		return (
				<div>
					<p>Welcome, {session.user?.name}!</p>
					<button onClick={() => signOut()}>Sign out</button>
				</div>
		);
	}
	
	return <button onClick={() => signIn("google")}>Sign in with Google</button>;
}