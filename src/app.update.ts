import {
	Ctx,
	Hears,
	InjectBot,
	Message,
	On,
	Start,
	Update
} from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { setTimeout } from 'timers'
import { dialogButtonsData, getQuesionsListButtons, vacancyButtons } from './app.buttons'
import { AppService } from './app.service'
import { feedback, getUserInfo, greet, questionsListData } from './app.utils'
import { Context } from './context.interface'

@Update()
export class AppUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly appService: AppService
	) { }

	@Start()
	async startCommand(ctx: Context) {

		ctx.session.chatId = ctx.message.chat.id
		ctx.session.user = {
			fist_name: ctx.message.from?.first_name,
			id: ctx.message.from?.id,
			lastname: ctx.message.from.last_name,
			username: ctx.message.from.username
		}

		await ctx.replyWithPhoto('https://habrastorage.org/getpro/moikrug/uploads/redactor_image/07102021/images/1d3f8e9db6a384ee70c343e40fefd25f.jpg')
		await ctx.reply('<a href="https://vc.ru/u/664283-valeriya-bondareva/532074-kak-sozdat-autstaff-kompaniyu-imeya-5k-v-karmane-i-za-2-goda-vyrasti-do-24-chelovek-i-350k-godovogo-oborota" >С чего мы начинали </a>', { parse_mode: 'HTML' })

		setTimeout(async () => (
			await ctx.reply(greet(ctx.message.from.first_name))
		), 1000)

		setTimeout(async () => (
			await ctx.reply('Скажите , пожалуйста, в каком направлении Вы работаете?', vacancyButtons)
		), 3000)

		// setTimeout(async () => (
		// 	await ctx.reply(questionsList[0], dialogButtons(1))
		// ), 3000)

		// ctx.session.count++

	}

	@Hears(['Frontend', 'Backend'])
	async setVacancy(ctx: Context) {
		//@ts-ignore
		ctx.session.vacancy = ctx.message.text
		ctx.session.count = 1
		ctx.session.answers = []
		// console.log(ctx.message);
		const count = ctx.session.count
		const questionsList = questionsListData[ctx.session.vacancy]
		const dialogButtons = dialogButtonsData[ctx.session.vacancy]
		await ctx.reply(questionsList[0], dialogButtons[0])
	}

	@Hears(['Вопросы'])
	async setQuestionsList(ctx: Context) {
		//@ts-ignore
		ctx.session.vacancy = ctx.message.text
		ctx.session.count = 1
		ctx.session.answers = []
		// console.log(ctx.message);
		const count = ctx.session.count
		const questionsList = questionsListData[ctx.session.vacancy]
		const dialogButtons = dialogButtonsData[ctx.session.vacancy]
		await ctx.reply('', getQuesionsListButtons)
	}

	@Hears(['фронт'])
	async sendFrontQuestionsList(ctx: Context) {
		const questionsList = questionsListData['Frontend']
		await ctx.reply(questionsList.join('\n'))
	}
	@Hears(['бэк'])
	async sendBackQuestionsList(ctx: Context) {
		const questionsList = questionsListData['Backend']
		await ctx.reply(questionsList.join('\n'))
	}

	@On('message')
	async getMsg(@Message('message') message: string, @Ctx() ctx: Context) {

		if (!ctx.session.vacancy) {
			return ctx.reply('Скажите , пожалуйста, в каком направлении Вы работаете?', vacancyButtons)
		}

		let count = ctx.session.count
		const questionsList = questionsListData[ctx.session.vacancy]
		const dialogButtons = dialogButtonsData[ctx.session.vacancy]
		//@ts-ignore
		if (count >= questionsList.length) {
			//@ts-ignore
			ctx.session.answers.push(`${count}. ${ctx?.message?.text || '-'}`)
			//@ts-ignore
			const cv = ctx.message?.document?.file_id
			ctx.session.cv = cv

			await ctx.reply(feedback(), dialogButtons.remove)

			const userInfo = getUserInfo(ctx.session.user)
			const answers = `\n${ctx.session?.answers?.join('\n')}`
			const userVacancy = `Вакансия: ${ctx.session?.vacancy}`

			//@ts-ignore
			await ctx.telegram.sendMessage(1182528963, `${userInfo}\n${userVacancy}\n${answers}`, { parse_mode: 'HTML' }) // @ValeriBondareva
			await ctx.telegram.sendMessage(1159742269, `${userInfo}\n${userVacancy}\n${answers}`, { parse_mode: 'HTML' }) //@ppayko
			//@ts-ignore
			cv && await ctx.telegram.sendDocument(1182528963, ctx.message.document.file_id) && await ctx.telegram.sendDocument(1159742269, ctx.message.document.file_id)

		} else if (count && count < questionsList.length) {

			//@ts-ignore
			if (count === 7 && ctx?.message?.text === "Физлицо в статусе ИП") {
				//@ts-ignore
				ctx.session.answers.push(`${count}.${ctx?.message?.text}`)
				ctx.session.answers.push(`${count + 1}.-`)
				ctx.session.count += 2

				setTimeout(async () => {
					await ctx.reply(questionsList[count + 1], dialogButtons[count])
				}, 750)
			} else {
				setTimeout(async () => {
					await ctx.reply(questionsList[count], dialogButtons[count])
					//@ts-ignore
					ctx.session.answers.push(`${count}. ${ctx?.message?.text || '-'} `)
					ctx.session.count++
				}, 750)
			}
		} else {
			await ctx.reply('/start')
		}
	}
}
