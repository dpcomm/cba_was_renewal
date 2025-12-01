import cron from 'node-cron';
import ChatService from '@services/chatService';
import CarpoolService from '@services/carpoolService';

const chatService = new ChatService;
const carpoolService = new CarpoolService;

// 매일 새벽 4시에 redis에서 mysql로 chat이동
cron.schedule('0 4 * * *', () => {
    console.log("chat flush start");
    chatService.flushAllChats();
    console.log("chat flush end");
});

cron.schedule('*/5 * * * *', () => {
    console.log("sending carpool ready message");
    const currentTime: Date = new Date();
    carpoolService.checkCarpoolReady(currentTime);
});

cron.schedule('0 */1 * * *', () => {
    console.log("old carpool arrive update");
    const currentTime: Date = new Date();
    carpoolService.oldCarpoolArriveUpdate(currentTime);
});

// cron.schedule('* * * * *', () => {
//     console.log("test flush start");
//     chatService.flushAllChats();
//     console.log("test flush end");
// });

