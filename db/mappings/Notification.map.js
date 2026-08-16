import { EntitySchema } from "@mikro-orm/postgresql";
import { Notification } from "../../app/models/Notification.js";

/** Provides the NotificationMapper public API for its configured application behavior. */
export const NotificationMapper = new EntitySchema({
    class: Notification,
    tableName: "notifications",
    properties: {
        id: { type: "string", primary: true },
        type: { type: "string" },
        notifiableType: { type: "string" },
        notifiableId: { type: "string" },
        channels: { type: "text" },
        data: { type: "text" },
        readAt: { type: "Date", nullable: true },
        createdAt: { type: "Date", defaultRaw: "CURRENT_TIMESTAMP" },
    },
    indexes: [
        { name: "notifications_notifiable_index", properties: ["notifiableType", "notifiableId", "readAt"] },
        { name: "notifications_type_index", properties: ["type"] },
    ],
});
