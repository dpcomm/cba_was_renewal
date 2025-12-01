import { chatDto } from '@dtos/chatDto';
import redisClient from '@utils/redis';
import { Socket } from 'socket.io';
import ChatRepository from '@repositories/chatRepository';
import stringify from 'json-stable-stringify';

const chatRepository = new ChatRepository();
const MAX_MESSAGES = 50;

export default async function ( socket: Socket, chatDTO: chatDto, callback: Function) {
    try {
        const redisKey = `chatroom:${chatDTO.roomId}:message`;
        const timestamp = new Date(chatDTO.timestamp).getTime() + chatDTO.senderId * 1e-5;

        console.log(`user${chatDTO.senderId} request message loading`);

        // const exact = await redisClient.zRangeByScore(redisKey, timestamp, timestamp);
        const rank = await redisClient.zRank(redisKey, stringify(chatDTO)!);
        console.log(`rank: ${rank}`);
        console.log(`targetChat: ${stringify(chatDTO)}`);
        console.log('current Redis list');
        const currentRedis = await redisClient.zRange(redisKey, 0, -1, {withScores: true} as any);
        console.log(currentRedis);

        if (rank == null) {
            //현재 redis에 있는 가장 오래된 chat의 timestamp 구하기
            const redistOldestRaw = await redisClient.zRange(redisKey, 0, 0, { withScores: true } as any);
            const redisOldestScore = redistOldestRaw.length === 2 ? new Date(Math.trunc(Number(redistOldestRaw[1]))) : undefined;

            //구해진 timestamp구간의 chat을 DB로부터 획득 
            const mysqlChats: chatDto[] = await chatRepository.getChatsBetween(chatDTO.roomId, new Date(Math.trunc(timestamp)), redisOldestScore);

            //DB에서 획득한 chat을 redis에 cache
            if (mysqlChats.length > 0) {
                const redisZaddData = mysqlChats.map(chat => ({
                    score: new Date(chat.timestamp).getTime() + chat.senderId * 1e-5,
                    value: stringify(chat)!,
                }));
                await redisClient.zAdd(redisKey, redisZaddData);
            }

            const requestedChats: chatDto[] = await chatRepository.getChatsForward(chatDTO.roomId, chatDTO.senderId, new Date(chatDTO.timestamp), 50);
            console.log(requestedChats);
            if (requestedChats.length > 0) {
                const redisZaddData = requestedChats.map(chat => ({
                    score: new Date(chat.timestamp).getTime() + chat.senderId * 1e-5,
                    value: stringify(chat)!,
                }));
                await redisClient.zAdd(redisKey, redisZaddData);
            }
        } else if (rank >= 50) { 
            
        } else {
            const requestedChats: chatDto[] = await chatRepository.getChatsForward(chatDTO.roomId, chatDTO.senderId, new Date(chatDTO.timestamp), 50 - rank);
            if (requestedChats.length > 0) {
                const redisZaddData = requestedChats.map(chat => ({
                    score: new Date(chat.timestamp).getTime() + chat.senderId * 1e-5,
                    value: stringify(chat)!,
                }));
                await redisClient.zAdd(redisKey, redisZaddData);
            }            
        }

        var currentRank = await redisClient.zRank(redisKey, stringify(chatDTO)!);
        if (currentRank == null) currentRank = 50;
        console.log(`currentRank: ${currentRank}`);
        const rawResults = await redisClient.zRange(
            redisKey, 
            currentRank != null && currentRank >= 50 ? currentRank - 50 : 0,
            currentRank != null && currentRank >= 50 ? currentRank - 1: currentRank,
        );

        const chats = rawResults.map(chat => JSON.parse(chat) as chatDto);
        
        console.log('result chat');
        console.log(chats);

        const result = {
            success: true,
            message: "loading messages",
            chats: chats,
        };

        callback(result);


    } catch (err: any) {
        callback({status: "loading message error", message: err.message, err: err});
    }

} 


/*
처리과정
1. redis에 기준이 되는 chat이 있는지 확인.
2. 있다면 해당 chat으로부터 앞으로 몇개가 있는지 확인
3. 50개보다 많거나 같으면 1번으로 수행
4. 50개보다 적으면 2번으로 수행
5. 만약 chat이 redis에 없으면 3번으로 수행

1. redis에 전송할 메세지가 전부 있을 때,
    1-1. redis에서 기준되는 chat 앞으로 50개 보내기
2. redis애 전송할 메세지가 일부만 있을 때,
    2-1. DB에서 몇개를 가져와야하는지 확인
    2-2. 해당 개수만큼 요청하기
    2-3. 앞에서 50개 보내기기
3. redis에 전송할 메세지가 하나도 없을 때, 
    3-1. 현재 redis에 있는 가장 오래된 chat 찾기
    3-2. 기준으로 전달받은 chat과 현재 redis간의 공백 매우기
    3-3. 기준으로 전달받은 chat을 기준으로 앞으로 50개 불러오기
    3-4. redis에서 앞에서 50개 보내기

*/





/*
메세지 리스트 요청 과정
1. 채팅방에 입장할 때
1-1. 채팅방에 들어온 적이 없을 때
    서버의 모든 채팅 불러오기
1-2. 채팅방에 들어온 적이 있지만 기록된 채팅이 없을 때,
    서버의 모든 채팅 불러오기
1-3. 채팅방에 들어온 적이 있고, 기록된 채팅이 있을 때,
    기록된 채팅 이전의 채팅 50개를 가져오고, 기록된 채팅부터 전부 불러오기

2. 채팅방에 있을 때,
2-1. 채팅방 상단으로 스크롤을 할 때,
    현재 앱이 state로 가지고 있는 최상단의 채팅을 기준으로 그 이전의 채팅 50개 불러오기

요구되는 기능
    1. 특정 채팅을 기준으로 이전의 50개를 가져오는 기능
    2. 특정 채팅을 기준으로 이후의 모든 채팅을 가져오는 기능
    3. 서버에 존재하는 모든 채팅을 가져오기

    모든 채팅의 전송시 과도한 양의 채팅을 한번에 불러오기는 어렵기에 50개씩 잘라서 전송을 해줌
    대신 client에서 전송받은 chats들을 확인, 50개보다 적게 들어올 때까지 반복

    결과적으로 특정 채팅을 기준으로 50개의 채팅을 가져오는 기능. 이를 단순한 앞뒤로 구분해서 따로 작성할지, 하나의 flag를 두고 같은 함수를 공유할지

    주의할 점. 만약 채팅 불러오기와 chat on이 겹친다면 어떻게 해결할지.
    채팅을 불러오는 동안은 chat on이 수행되지 않도록 순서를 조정. 화면상에서도 중간단을 둬서 그 시간동안 불러오기 진행. 불러오기가 완료되면 UI제공, chat on

    클라이언트에서 기록된 채팅이 있는지의 판단여부는 state가 empty한지의 여부에 따라 수행
    그를 위해서 클라이언트에서는 viewmodel이 생성될 때, recentChat을 state에 넣어줘야함
*/