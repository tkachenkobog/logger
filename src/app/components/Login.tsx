"use client";
import Image from 'next/image';
import { signIn } from "next-auth/react";

export default function Login () {
	
	return (
			<div className="flex flex-col items-center border rounded-2xl border-gray-500 p-6">
				<h3>Login with</h3>
				<div className="flex gap-2">
					<button className="border rounded p-2 border-gray-500" onClick={ () => signIn('google') }>
						<Image src="/google.svg" alt="Google Logo" width={ 24 } height={ 24 }/>
					</button>
					<button className="border rounded p-2 border-gray-500" onClick={ () => signIn('google') }>
						<Image src="/google.svg" alt="Google Logo" width={ 24 } height={ 24 }/>
					</button>
					<button className="border rounded p-2 border-gray-500" onClick={ () => signIn('google') }>
						<Image src="/google.svg" alt="Google Logo" width={ 24 } height={ 24 }/>
					</button>
				</div>
			</div>
	)
}