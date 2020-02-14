import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/fields/list";
import { Constants } from '../Common';
import { IPollService } from "../Interfaces/IPollService";
import { IQuestionDetails } from '../Models';
import { ServiceKey } from "@microsoft/sp-core-library";

export default class PollService implements IPollService {

	public static readonly serviceKey: ServiceKey<IPollService> = ServiceKey.create<IPollService>("SPOLL:PollService", PollService);

	async getPollQuestions(listid: string): Promise<IQuestionDetails[]> {
		try {
			let retQuestionDetails: IQuestionDetails[] = [];
			let listFields = await sp.web.lists.getById(listid).fields
								.filter(`Hidden eq false`)
								.get();
			console.log(listFields);
			return retQuestionDetails;
		} catch (err) {
			console.log(err);
		}
	}


	getPollQuestionById(listID: string, questionID: string): Promise<IQuestionDetails> {
		throw new Error("Method not implemented.");
	}


}