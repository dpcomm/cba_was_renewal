import DashboardRepository from "@repositories/dashboardRepository";

const dashBoardRepository = new DashboardRepository();


class DashboardService {
	async getDashboard() {
		try {
			const groupCount = await dashBoardRepository.findAllGroupMembers();
			const registryMembers = await dashBoardRepository.findAllRegistryMembers();
			const PaidMembers = await dashBoardRepository.findAllPaidMembers();
			const AtendMembers = await dashBoardRepository.findAllAtendMembers();

			return ({
				ok: 1,
				message: "getDashboard success",
				data: {
					groups: groupCount,
					"attended": {
						"isAttended": AtendMembers,
						"isPaid": PaidMembers,
						"application": registryMembers,
					}
				}
			});
		} catch(err) {
			throw err;
		}
	}
}


export default DashboardService;