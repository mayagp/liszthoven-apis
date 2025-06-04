enum NotificationTypeEnum {
  FEEDBACK = 0,
  SCHEDULE = 1,
  EVENT_PARTICIPANT = 2,
  SALE_INVOICE = 3,
  SALE_PAYMENT = 4,
  SALE_RETURN = 5,
  DELIVERY_ORDER = 6,
  EVENT = 7,
}

export const getNotificationTypeEnumLabel = (
  notificationTypeEnum: NotificationTypeEnum,
) => {
  switch (notificationTypeEnum) {
    case NotificationTypeEnum.FEEDBACK:
      return 'Feedback';
    case NotificationTypeEnum.SCHEDULE:
      return 'Schedule';
    case NotificationTypeEnum.EVENT_PARTICIPANT:
      return 'Event Participant';
    case NotificationTypeEnum.SALE_INVOICE:
      return 'Sale Invoice';
    case NotificationTypeEnum.SALE_PAYMENT:
      return 'Sale Payment';
    case NotificationTypeEnum.SALE_RETURN:
      return 'Sale Return';
    case NotificationTypeEnum.DELIVERY_ORDER:
      return 'Delivery Order';
    case NotificationTypeEnum.EVENT:
      return 'Event';
    default:
      return 'Unknown';
  }
};

export const getNotificationTypeEnums = () => {
  const enums = Object.entries(NotificationTypeEnum);
  const result: { id: NotificationTypeEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getNotificationTypeEnumLabel(+value),
      });
    }
  }

  return result;
};

export default NotificationTypeEnum;
