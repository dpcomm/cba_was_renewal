export interface chatDto {
  senderId: number,
  roomId: number,
  message: string,
  timestamp: string,  //ISO8601 문자열로 들어옴
}

export interface requestUnreadChatDto {
  recentChat: chatDto,
  requestAll: boolean,
}