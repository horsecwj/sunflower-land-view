import chicken from "assets/announcements/chickens.gif";
import nugget from "assets/announcements/nugget.gif";
import nomad from "assets/announcements/nomad.gif";
import cakes from "assets/announcements/cakes.png";
import rooster from "assets/announcements/rooster.png";
import shovel from "assets/announcements/shovel.png";
import warWeekOne from "assets/announcements/war_week_1.png";
import warWeekTwo from "assets/announcements/war_week_two.png";
import warWeekThree from "assets/announcements/war_week_three.png";
import warTent from "assets/announcements/war_tent.png";
import roadmap from "assets/announcements/roadmap.png";
import merchant from "assets/announcements/merchant.png";
import bumpkin from "assets/announcements/bumpkin.png";
import warriorTop from "assets/announcements/warrior_top.png";
import greenAmulet from "assets/bumpkins/shop/necklaces/green_amulet.png";
import boat from "assets/announcements/boat.png";
import warDrop from "assets/announcements/war_drop.png";

export interface Announcement {
  date: Date;
  image?: string;
  title: string;
  notes: string[];
  link?: string;
  type?: "war";
}

/**
 * Announcements are shown in game after the `date`.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    date: new Date("2022-10-19T00:00:00"),
    title: "Sending the cavalry",
    notes: [
      "It's getting rough out there.",
      "We are going to need more troops, let's stock up ready for their arrival.",
      "Next week we will launch our main attack and end this war once and for all!",
      "“外面越来越乱了。”、“我们需要更多的部队，让我们为他们的到来做好准备。”、“下周我们将发动主攻，一劳永逸地结束这场战争！”,",
    ],
    type: "war",
  },
  {
    date: new Date("2022-10-12T00:00:00"),
    title: "War Tent Items",
    notes: [
      "All war tent items will become available for crafting",
      "6am UTC 13th October",
      "New Items: Skull Hat, War Skull, Undead Chicken & War Tombstone.",
      "“所有战争帐篷物品都可用于制作”、“UTC 时间 10 月 13 日上午 6 点”、“新物品：骷髅帽、战争骷髅、亡灵鸡和战争墓碑。”、",
    ],
    type: "war",
    image: warDrop,
  },
  {
    date: new Date("2022-10-11T00:00:00"),
    title: "New Wallet Transfer",
    notes: [
      "If you need to transfer your account to a new wallet, you can now do it in-game",
      "Access Menu > Settings > Transfer Ownership",
      "This is useful if your wallet is compromised or you want to move your farm to a new wallet.",
      '“如果您需要将帐户转移到新钱包，现在可以在游戏中进行”、“访问菜单 > 设置 > 转移所有权”、“如果您的钱包被盗或您想将农场转移到一个新钱包。",',
    ],
  },
  {
    date: new Date("2022-10-10T00:00:00"),
    title: "You are my sunshine",
    notes: [
      "The war is starting to take its toll on the troops.",
      "I think we need to boost morale so we can continue fighting.",
      "Moonshine is a popular choice of drink in this situation but we can make it stronger with Sunshine.",
      '“战争开始对部队造成伤害。”，“我认为我们需要鼓舞士气，这样我们才能继续战斗。”，“在这种情况下，月光是一种流行的饮料选择，但我们可以用阳光让它变得更强大.",',
    ],
    type: "war",
  },
  {
    date: new Date("2022-10-04T00:00:00"),
    title: "Green Amulet Drop",
    notes: [
      "At 11pm 2022-10-05 UTC, the Green Amulet will be dropped.",
      "Visit the War Tent at Goblin Village to craft it.",
      '"2022-10-05 UTC 晚上 11 点，绿色护身符将被掉落。", "前往哥布林村的战争帐篷制作它。"',
    ],
    image: greenAmulet,
  },
  {
    date: new Date("2022-10-03T00:00:00"),
    title: "Making waves",
    notes: [
      "It looks like we are going to run out of land if we keep expanding.",
      "The war effort has attracted lots of attention so we should consider building a boat to explore.",
      "“如果我们继续扩张，看起来我们的土地将用完。”，“战争努力引起了很多关注，所以我们应该考虑建造一艘船进行探索。”，",
    ],
    image: boat,
    type: "war",
  },
  {
    date: new Date("2022-09-27T00:00:00"),
    title: "Warrior Shirt Drop",
    notes: [
      "At 12am 2022-09-28 UTC, the Warrior Shirt will be dropped.",
      "Visit the War Tent at Goblin Village to craft it.",
      "250 will become available for a discounted price of 650 war bonds.",
      '"2022 年 9 月 28 日凌晨 12 点，战士衬衫将被丢弃。", "前往哥布林村的战争帐篷制作它。", "250 将可用 650 战争债券的折扣价出售。",',
    ],
    image: warriorTop,
  },
  {
    date: new Date("2022-09-26T02:00:00"),
    title: "Bumpkin Art Competition",
    notes: [
      "Calling all artists for the first official art contest!",
      "Design Bumpkin NFT items and get your art in the game.",
      "30,000 SFL in prizes to be won for the community",
      "“召集所有艺术家参加第一次官方艺术比赛！”、“设计 Bumpkin NFT 物品并在游戏中获得你的艺术。”、“为社区赢得 30,000 SFL 的奖品”，",
    ],
    link: "https://github.com/sunflower-land/sunflower-land/discussions/1434",
    image: bumpkin,
  },
  {
    date: new Date("2022-09-26T00:00:00"),
    title: "Something Smells bad",
    notes: [
      "We are getting reports that the enemy has a secret weapon they found in a cave.",
      "We need to craft more swords if we are going to win this war.",
      "It's also possible to make stink bombs from rotten eggs, the pulp of a pumpkin and some mouldy cabbages.",
      '“我们收到报告说敌人在山洞里发现了秘密武器。”，“如果我们要赢得这场战争，我们需要制造更多的剑。”，“也可以用臭鸡蛋制造臭弹，南瓜的果肉和一些发霉的卷心菜。",',
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/goblin-war",
    type: "war",
  },
  {
    date: new Date("2022-09-19T04:00:00"),
    title: "The Halvening is coming!",
    notes: [
      "In-game buy and sale prices are about to half!",
      "At 2022-09-21 12:00am UTC all in-game prices will automatically change.",
      "Make sure you are prepared!",
      '"游戏内买卖价格将减半！", "UTC 时间 2022-09-21 12:00am 所有游戏内价格将自动更改。", "请做好准备！",',
    ],
    link: "https://docs.sunflower-land.com/economy/tokenomics/the-halvening",
  },
  {
    date: new Date("2022-09-19T00:00:00"),
    title: "Setting the stage",
    notes: [
      "Great work clearing the land, now we can start to build.",
      "We will need to create some shelter and a training ground in order for the soldiers to prepare for the big siege.",
      "I’ve made a list of things that we will need to get started.",
      "“清理土地的工作很棒，现在我们可以开始建造了。”，“我们需要建造一些避难所和训练场，以便士兵为大围攻做准备。”，“我已经列出了我们需要开始的事情。",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/goblin-war",
    image: warWeekThree,
    type: "war",
  },
  {
    date: new Date("2022-09-18T23:00:00"),
    title: "Community Garden",
    notes: [
      "The Community Garden offers NFTs built entirely by the community.",
      "You can access the garden by visiting the merchant west of the town.",
      '"社区花园提供完全由社区建造的 NFT。", "您可以通过拜访镇西的商人进入花园。",',
    ],
    link: "https://docs.sunflower-land.com/player-guides/islands/community-garden",
    image: merchant,
  },
  {
    date: new Date("2022-09-15T22:00:00"),
    title: "Roadmap Updates",
    notes: [
      "The team is getting closer to launch!",
      "Land Expansion, more crops, more buildings & more resources.",
      "Have a sneak peak of what is coming",
      "“团队越来越接近发射！”，“土地扩张，更多作物，更多建筑和更多资源。”，“先睹为快”，",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/roadmap/launch",
    image: roadmap,
  },
  {
    date: new Date("2022-09-12T00:00:00"),
    title: "The woods for the trees",
    notes: [
      "War is big business and requires a lot of land.",
      "We need to cut down the Forrest to the south, this will provide ample room for our soldiers to train and prepare.",
      "We have negotiated a deal with the local blacksmith who can help you with a much better rate on the items you need.",
      '“战争是大生意，需要很多土地。”，“我们需要在南部砍伐福雷斯特，这将为我们的士兵提供足够的训练和准备空间。”，“我们已经与当地谈判达成了一项协议。铁匠可以帮助您以更高的价格购买您需要的物品。",',
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/goblin-war",
    image: warWeekTwo,
    type: "war",
  },
  {
    date: new Date("2022-09-08T00:00:00"),
    title: "The war tent opens!",
    notes: [
      "The war tent is now open",
      "Visit Goblin Village to view the available rare items.",
      "Each week new limited edition items will become available.",
      "“战争帐篷现已开放”，“访问哥布林村以查看可用的稀有物品。”，“每周都会推出新的限量版物品。”，",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/goblin-war",
    image: warTent,
    type: "war",
  },
  {
    date: new Date("2022-09-05T00:00:00"),
    title: "The war begins",
    notes: [
      "All this talk of war makes me hungry.",
      "If we are going to survive the next few weeks we better prepare some food for ourselves and the troops.",
      "These rations will need to last us for at least 10 weeks",
      "Visit the war collectors and see what food is needed",
      "“所有这些关于战争的话题都让我感到饥饿。”、“如果我们要在接下来的几周里活下来，我们最好为自己和部队准备一些食物。”、“这些口粮至少需要我们吃 10 周” ，“拜访战争收藏家，看看需要什么食物”，",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/goblin-war",
    image: warWeekOne,
    type: "war",
  },
  {
    date: new Date("2022-07-21T00:00:00"),
    title: "Shovel",
    notes: [
      "The shovel is now available!",
      "Use it to remove unwanted crops.",
      "Double tap crops to remove them.",
      "Craft it at the Blacksmith.",
      "“铲子现在可用！”，“用它来移除不需要的作物。”，“双击作物以移除它们。”，“在铁匠那里制作它。”，",
    ],
    link: "https://docs.sunflower-land.com/player-guides/crop-farming#tools",
    image: shovel,
  },
  {
    date: new Date("2022-07-04T00:00:00"),
    title: "Rooster",
    notes: [
      "The rooster is now available!",
      "Doubles the chance of dropping a mutant chicken.",
      "Craft it at Goblin Village.",
      '"公鸡现已上市！", "双倍几率掉落变异鸡。", "在地精村制作。",',
    ],
    link: "https://docs.sunflower-land.com/player-guides/rare-and-limited-items#boosts-1",
    image: rooster,
  },
  {
    date: new Date("2022-06-26T23:57:05.618Z"),
    title: "Cakes",
    notes: [
      "Craft a new cake weekly!",
      "Collect them all!",
      "Will you win the great bake off?",
      "“每周制作一个新蛋糕！”，“把它们都收集起来！”，“你会赢得伟大的烘焙大赛吗？”，",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/the-great-sunflower-bakeoff",
    image: cakes,
  },
  {
    date: new Date("2022-06-22T06:27:20.861Z"),
    title: "Traveling Salesman",
    notes: [
      "Find weekly offers.",
      "Trade resources for items.",
      "What will be the next offer?",
      "“查找每周报价。”，“物品的贸易资源。”，“下一个报价是什么？”，",
    ],
    link: "https://docs.sunflower-land.com/fundamentals/special-events/traveling-salesman",
    image: nomad,
  },
  {
    date: new Date("Mon, 20 Jun 2022 22:30:00 GMT"),
    title: "Nugget is open for crafting!",
    notes: [
      "Gives a 25% increase to Gold Mines.",
      "Price: 50 Gold, 300 SFL",
      "Supply: 1000",
      '"使金矿增加 25%。", "价格: 50 金, 300 SFL", "供应: 1000",',
    ],
    link: "https://docs.sunflower-land.com/player-guides/rare-and-limited-items#boosts",
    image: nugget,
  },
  {
    date: new Date(
      "Tue Jun 01 2022 10:06:50 GMT-0300 (Brasilia Standard Time)"
    ),
    title: "Chickens",
    notes: [
      "Craft chickens at the Barn.",
      "Feed chickens wheat and collect eggs.",
      "Craft a rare Chicken Coop to grow your egg empire.",
      "Will you be lucky enough to find a mutant chicken in an egg?",
      "“在谷仓制作鸡。”，“喂鸡小麦并收集鸡蛋。”，“制作稀有鸡舍来发展你的鸡蛋帝国。”，“你会幸运地在鸡蛋中找到变异鸡吗？”，",
    ],
    link: "https://docs.sunflower-land.com/player-guides/raising-animals/chickens",
    image: chicken,
  },
];
