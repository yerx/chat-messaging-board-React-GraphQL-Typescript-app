import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

// create async main function
const main = async () => {
  // connect to the database
  const orm = await MikroORM.init(microConfig);
  // run migrations
  await orm.getMigrator().up();
  // run sql
  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);
  const posts = await orm.em.find(Post, {});
  console.log(posts);
};

main().catch((err) => {
  console.error(err);
});
