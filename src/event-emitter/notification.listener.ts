// import { Injectable } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Sequelize } from 'sequelize-typescript';
// import { User } from 'src/features/user/entities/user.entity';

// @Injectable()
// export class NotificationListener {
//   sequelize: Sequelize;
//   constructor(sequelize: Sequelize) {
//     this.sequelize = sequelize;
//   }

//   @OnEvent('notification')
//   async notification(options: Array<string>, data: any) {
//     try {
//       if (options.includes('email')) {
//         await this.email(data);
//       }

//       if (options.includes('system')) {
//         await this.system(data);
//       }
//       return true;
//     } catch (error) {
//       console.log('error', error);
//     }
//   }

//   private async system(data) {
//     const notificationReceipts = [];
//     if (Array.isArray(data.notified_user_id)) {
//       const users = await User.findAll({
//         where: { id: data.notified_user_id },
//       });

//       if (users.length !== data.notified_user_id.length) {
//         throw new Error('User not found');
//       }

//       const notifyUsers = users.map((user) => {
//         return {
//           user_id: user.id,
//           is_sent: true,
//           delivery_channel: DeliveryChannelEnum.IN_APP,
//         };
//       });

//       notificationReceipts.concat(notifyUsers);
//     } else {
//       notificationReceipts.push({
//         user_id: data.notified_user_id,
//         is_sent: true,
//         delivery_channel: DeliveryChannelEnum.IN_APP,
//       });
//     }

//     const user = await User.findOne({
//       where: { id: data.notified_user_id },
//     });

//     if (user) {
//       await Notification.create(
//         {
//           type: data.type,
//           metadata: JSON.stringify({ id: data.data.id }),
//           title: data.title,
//           message: data.message,
//           notification_receipients: notificationReceipts,
//         },
//         { include: [{ association: 'notification_receipients' }] },
//       );
//     }
//   }

//   private async email(data) {
//     const mail = new MailHelper();
//     if (!Array.isArray(data.email)) {
//       data.email = [data.email];
//     }

//     const payloads = data.email;
//     for (const payload of payloads) {
//       mail.sendEmail(payload.mail_to, payload.subject, payload.template);
//     }
//   }
// }
