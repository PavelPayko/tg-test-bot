import { Context as ContextTelegraf } from 'telegraf'

export type User = {
	fist_name: string,
	id: number
	lastname?: string,
	username?: string
}

export interface Context extends ContextTelegraf {
	session: {
		count?: number,
		answers: string[],
		user: User,
		chatId: number,
		vacancy?: 'Frontend' | 'Backend'
		cv?: string
	}
}
