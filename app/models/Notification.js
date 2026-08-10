/**
 * User-facing notification delivery record.
 *
 * @property {string} id Stable notification identifier.
 * @property {string} type Application notification type.
 * @property {string} notifiableType Recipient model/type name.
 * @property {string} notifiableId Recipient identifier.
 * @property {string} channels JSON list of channels used for delivery.
 * @property {string} data JSON payload rendered by the application.
 * @property {Date|null} readAt Time the recipient marked it read.
 * @property {Date} createdAt Creation time.
 */
export class Notification {
    id;
    type;
    notifiableType;
    notifiableId;
    channels;
    data;
    readAt;
    createdAt = new Date();

    constructor(id, type, notifiableType, notifiableId, channels, data) {
        this.id = id;
        this.type = type;
        this.notifiableType = notifiableType;
        this.notifiableId = notifiableId;
        this.channels = JSON.stringify(channels);
        this.data = JSON.stringify(data);
    }
}
