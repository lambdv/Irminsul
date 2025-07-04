import { format } from 'timeago.js';
import Image from 'next/image';
import styles from './index.module.css';
import db from "@/db/db";
import { commentsTable } from "@/db/schema/comment";
import { usersTable } from "@/db/schema/user";
import { desc, eq } from "drizzle-orm";
import { isUserSupporterById } from '../support/actions';

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
    
    // Pre-fetch supporter status for all comments
    const supporterStatuses = await Promise.all(
        comments.map(comment => isUserSupporterById(comment.userId))
    );

    return (
        <div className={`${styles.bentoItem} ${styles.recentComments}`}>
            <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--text-color)'}}>Latest Comments</h3>
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
                                unoptimized={false}
                            />
                            <div className="flex flex-row gap-2">
                                <span className={styles.commentUserName}>{comment.userName}</span>
                                {supporterStatuses[index] && (
                                    <span style={{fontSize: "16px", top: "2px", userSelect: "none"}} className="material-symbols-rounded ml-0 relative" title="Verified">verified</span>
                                )}
                            </div>
                            <span className={styles.commentTime}>{format(comment.createdAt)}</span>
                        </div>
                        <p className={styles.commentText}>{comment.comment}</p>
                        {/* <a href={ comment.page} className={styles.commentLink}>View discussion →</a> */}
                        <p className={styles.commentLink}>{comment.page}</p>
                    </div>
                ))}
            </div>
        </div>
    );
} 