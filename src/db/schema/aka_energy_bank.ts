import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, decimal, integer } from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "nanoid";
import { usersTable } from "./user";
import { pgEnum } from "drizzle-orm/pg-core";

/**
 * table for parameters for the energy recharge calculator
 */
// export const akaEnergyBankTable = pgTable("aka_energy_bank", {
//   id: varchar("id")
//     .primaryKey()
//     .$defaultFn(() => nanoid()),
//   userId: varchar("userId")
//     .notNull()
//     .references(() => usersTable.id),
//   createdAt: timestamp("createdAt")
//     .notNull()
//     .default(sql`now()`),

//   rotationLength: integer("rotation_length")
//     .notNull(),
//   // Character 1
//   character1: text("character1").notNull(),
//   character1SkillType: text("character1_skill_type").default("Press"),
//   character1SkillUses: integer("character1_skill_uses").default(0),
//   character1TimeOnField: integer("character1_time_on_field").default(0),
//   character1RotationsBetweenBursts: integer("character1_rotations_between_bursts").default(1),
//   character1TotalER: integer("character1_total_er").default(0),
//   character1FeedsTo: text("character1_feeds_to"),
//   character1FeedProportion: integer("character1_feed_proportion").default(0),
//   character1FavoniusTriggers: integer("character1_favonius_triggers").default(0),
//   character1BonusEnergy: integer("character1_bonus_energy").default(0),

//   // Character 2
//   character2: text("character2").notNull(),
//   character2SkillType: text("character2_skill_type").default("Press"),
//   character2SkillUses: integer("character2_skill_uses").default(0),
//   character2TimeOnField: integer("character2_time_on_field").default(0),
//   character2RotationsBetweenBursts: integer("character2_rotations_between_bursts").default(1),
//   character2TotalER: integer("character2_total_er").default(0),
//   character2FeedsTo: text("character2_feeds_to"),
//   character2FeedProportion: integer("character2_feed_proportion").default(0),
//   character2FavoniusTriggers: integer("character2_favonius_triggers").default(0),
//   character2BonusEnergy: integer("character2_bonus_energy").default(0),

//   // Character 3
//   character3: text("character3").notNull(),
//   character3SkillType: text("character3_skill_type").default("Press"),
//   character3SkillUses: integer("character3_skill_uses").default(0),
//   character3TimeOnField: integer("character3_time_on_field").default(0),
//   character3RotationsBetweenBursts: integer("character3_rotations_between_bursts").default(1),
//   character3TotalER: integer("character3_total_er").default(0),
//   character3FeedsTo: text("character3_feeds_to"),
//   character3FeedProportion: integer("character3_feed_proportion").default(0),
//   character3FavoniusTriggers: integer("character3_favonius_triggers").default(0),
//   character3BonusEnergy: integer("character3_bonus_energy").default(0),

//   // Character 4
//   character4: text("character4").notNull(),
//   character4SkillType: text("character4_skill_type").default("Press"),
//   character4SkillUses: integer("character4_skill_uses").default(0),
//   character4TimeOnField: integer("character4_time_on_field").default(0),
//   character4RotationsBetweenBursts: integer("character4_rotations_between_bursts").default(1),
//   character4TotalER: integer("character4_total_er").default(0),
//   character4FeedsTo: text("character4_feeds_to"),
//   character4FeedProportion: integer("character4_feed_proportion").default(0),
//   character4FavoniusTriggers: integer("character4_favonius_triggers").default(0),
//   character4BonusEnergy: integer("character4_bonus_energy").default(0),

    
//   // Global settings: null means that any application that uses this tuple should use the default value
//   clearTime: integer("clear_time"),
//   enemyHpParticles: text("enemy_hp_particles"),
//   particleRng: text("particle_rng"),
//   rotationMode: text("rotation_mode"),

//   //optional
//   title: text("title"),
//   description: text("description"),
//   source: text("source"),
//   tags: text("tags")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

// });

/**
 * erc parameter example
 * 
 * Clear time (seconds)	90
Enemy HP particles	Default
Particle RNG	Average
Rotation mode	Fixed
Rotation length	21

Character			Ayaka			Shenhe			Mona			Kazuha	

Skill uses per rotation (primary type)			Press	2		Press	2		Press	1		Press	2
Skill uses per rotation (secondary type)													
Feed particles to ally						Ayaka			Ayaka				
Feed primary skill particles to Ayaka													
Feed primary skill particles to Shenhe													
Feed primary skill particles to Mona													
Feed primary skill particles to Kazuha													
Feed secondary skill particles to Ayaka													
Feed secondary skill particles to Shenhe													
Feed secondary skill particles to Mona													
Feed secondary skill particles to Kazuha													
Feed Favonius particles to Ayaka													
Feed Favonius particles to Shenhe													
Feed Favonius particles to Mona													
Feed Favonius particles to Kazuha													
Proportion of particles fed						50%							
Favonius triggers per rotation													
Bonus non-particle energy per rotation													
Time on field			50%			20%			20%			10%	
Number of rotations between bursts			1			1			1			1	
Total energy recharge needed			155%			205%			280%			189%	
 */