import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {SocketService} from '../../services/socket.service';
import {Message} from '../../models/message';
import {MessageService} from '../../services/message.service';
import {ApiListResponse} from '../../../../classes/ApiListResponce';
import {User} from '../../models/user';
import {UserService} from '../../services/user.service';
import {Room} from '../../models/room';
import {RoomService} from '../../services/room.service';
import {MessageStatus} from '../../models/message.status';
import {filter, tap} from 'rxjs/operators';
import {NotifierService} from "../../notifier/notifier.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  room: Room;
  text: string = '';
  messages: Message[] = [];
  users: User[] = [];

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              private userService: UserService,
              private roomService: RoomService,
              private messageService: MessageService,
              private notifyService: NotifierService) {
  }

  ngOnInit() {
    this.initIoConnection();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.roomService.getRoomById(parseInt(paramMap.get('roomId'), 10)).subscribe((room: Room) => {
        this.room = room;
        this.socketService.connectRoom(this.room.id);
        this.messageService.getMessages(this.room.id)
          .subscribe((message: Message[]) => this.messages = message);
      });
      this.getUsersByRoom(parseInt(paramMap.get('roomId')));
    });
  }

  private initIoConnection(): any {
    this.socketService.initSocket();

    this.socketService.onMessage().pipe(
      filter((newMessage: Message) => this.messages.filter((message: Message) => message.uuid === newMessage.uuid).length === 0),
      tap((message: Message) => message.status = MessageStatus.Send),
      tap((message: Message) => this.messages.push(message)),
      tap((message: Message) => this.pushNotification(message)),
      tap((message: Message) => this.messageService.sendMessageReadInfo(message.uuid, this.room.id.toString()).subscribe()))
      .subscribe();

    this.socketService.onMessageUpdate().pipe(
      tap((messageUUID: String) => this.messages.filter((message: Message) => message.uuid === messageUUID)[0].readAmount++))
      .subscribe();
  }

  pushNotification(message: Message) {
    console.log(message.senderId);
    console.log(this.getUserById(message.senderId));
    const icon: string = this.getUserById(message.senderId).image;
    this.notifyService.message(message, icon);
  }

  async sendMessage() {
    const newMessage: Message = await new Message(this.text, this.room.id, 1);
    this.messages.push(newMessage);
    this.messageService.sendMessage(newMessage.toServerDto()).subscribe();
    this.text= '';
  }

  getUserFromDB(id: number) {
    this.userService.getUserById(id).subscribe((user: User) => {
      this.users.push(user);
    });
  }
  getUserById(id: number): User {
    console.log(this.users);
    const users = this.users.filter((user: User) => user.id === id);
    console.log(users);
    return this.users.filter(user => user.id === id)[0];
  }

  getUsersByRoom(roomId: number) {
    this.userService.getUserByRoom(roomId).subscribe((result: ApiListResponse<User>) => {
      this.users = result.data;
    });
  }

  // getUser(id: number): User {
  //   return this.users.filter((user: User) => user.id === id)[0];
  // }

  // async checkAndPushUser(id: number): Promise<any> {
  //   let user: User = await this.users.filter((user: User) => user.id === id)[0];
  //   if (!user) {
  //     this.getUserFromDB(id);
  //   }
  // }

  //
  // async checkAndPushMessage(newMessage: Message): Promise<any> {
  //   let checkMessage: Message = await this.messages.filter((message: Message) => message.uuid === newMessage.uuid)[0];
  //   if (!checkMessage) {
  //     this.messages.push(newMessage);
  //     // webpush.sendNotification()
  //     // new Notification(`You have unread message from ${this.getUser(newMessage.senderId)}`,{body: newMessage.text});
  //     this.messageService.sendMessageReadInfo(newMessage.uuid, newMessage.roomId).subscribe(result => {
  //       console.log('result');
  //       console.log(result);
  //     });
  //   } else {
  //     newMessage.status = MessageStatus.Send;
  //   }
  // }
  //
  // async checkMessage(newMessage: Message): Promise<boolean> {
  //   return await this.messages.filter((message: Message) => message.uuid === newMessage.uuid).length > 0;
  // }
}
