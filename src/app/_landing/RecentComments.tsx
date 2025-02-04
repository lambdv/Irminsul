import { format } from 'timeago.js';
import Image from 'next/image';
import styles from './index.module.css';
import db from "@/db/db";
import { commentsTable } from "@/db/schema/comment";
import { usersTable } from "@/db/schema/user";
import { desc, eq } from "drizzle-orm";

async function getRecentComments() {
    const comments = await db.select({
        comment: commentsTable.comment,
        createdAt: commentsTable.createdAt,
        page: commentsTable.page,
        userId: commentsTable.userId,
        userName: usersTable.name,
        userImage: usersTable.image,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .orderBy(desc(commentsTable.createdAt))
    .limit(5);

    return comments;
}

export default async function RecentComments() {
    const comments = await getRecentComments();

    return (
        <div className={`${styles.bentoItem} ${styles.recentComments}`}>
            <h3>Latest Comments</h3>
            <div className={styles.commentsList}>
                {comments.map((comment, index) => (
                    <div key={index} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                            <Image
                                src={comment.userImage}
                                alt={`${comment.userName}'s avatar`}
                                width={24}
                                height={24}
                                className={styles.commentAvatar}
                                unoptimized
                            />
                            <span className={styles.commentUserName}>{comment.userName}</span>
                            <span className={styles.commentTime}>{format(comment.createdAt)}</span>
                        </div>
                        <p className={styles.commentText}>{comment.comment}</p>
                        <a href={comment.page} className={styles.commentLink}>View discussion →</a>
                    </div>
                ))}
            </div>
        </div>
    );
} 