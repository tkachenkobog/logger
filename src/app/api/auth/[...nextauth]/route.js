import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const authOptions = {
	session: {
		strategy: 'jwt'
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			try {
				const checkUserResult = await pool.query(
						'SELECT * FROM users WHERE mail = $1',
						[user.email]
				);
				
				let userId;
				
				if (checkUserResult.rows.length === 0) {
					console.log(`Creating new user: ${user.email}`);
					
					userId = uuidv4();
					await pool.query(
							'INSERT INTO users (id, username, mail) VALUES ($1, $2, $3)',
							[
								userId,
								user.name || user.email.split('@')[0],
								user.email
							]
					);
					console.log(`User created successfully: ${user.email}`);
				} else {
					console.log(`User already exists: ${user.email}`);
					userId = checkUserResult.rows[0].id;
				}
				user.uuid = userId;
				
				return true;
			} catch (error) {
				console.error('Error in signIn callback:', error);
				return false;
			}
		},
		async jwt({ token, user }) {
			if (user?.uuid) {
				token.uuid = user.uuid;
			}
			return token;
		},
		async session({ session, token }) {
			if (token?.uuid) {
				session.user.uuid = token.uuid;
			}
			return session;
		}
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };