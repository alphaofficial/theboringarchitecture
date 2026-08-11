import { Migration } from '@mikro-orm/migrations';

export class Migration20260810065301 extends Migration {

  async up() {
    this.addSql(`create table \`notifications\` (\`id\` text not null, \`type\` text not null, \`notifiable_type\` text not null, \`notifiable_id\` text not null, \`channels\` text not null, \`data\` text not null, \`read_at\` datetime null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, primary key (\`id\`));`);
    this.addSql(`create index \`notifications_notifiable_index\` on \`notifications\` (\`notifiable_type\`, \`notifiable_id\`, \`read_at\`);`);
    this.addSql(`create index \`notifications_type_index\` on \`notifications\` (\`type\`);`);
  }

}
