'use client'

import CommentSectionCSS from "./commentsection.module.css"
import Image from "next/image"
import Btn from "./Btn"
import { format } from "timeago.js"
import { useEffect, useState } from "react"

interface CommentSectionClientProps {
    user: any;
    numberOfComments: number;
    comments: any[];
    pageID: string;
    color?: string;
    owner?: string;
    onCommentSubmit: (comment: string) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
}

export default function CommentSectionClient({
    user,
    numberOfComments,
    comments,
    pageID,
    color,
    owner,
    onCommentSubmit,
    onDeleteComment
}: CommentSectionClientProps) {

    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [commentsState, setCommentsState] = useState(comments)
    
    useEffect(() => {
        setCommentsState(comments)
        setIsSubmitting(false);
    }, [comments])

    return (
        <div className={CommentSectionCSS.commentSectionContainer} id="comments">
            <h1>{commentsState.length} Comments</h1>
            <div className={`${CommentSectionCSS.commentTextAreaContainer} flex flex-row mb-5`}>
                <Image 
                    src={user ? user.image : "/imgs/icons/defaultavatar.png"} 
                    alt="User Avatar" 
                    width={100} 
                    height={100} 
                    className={CommentSectionCSS.commentUserAvatar}
                    unoptimized={true}
                />
                <form className="flex flex-col gap-2 w-full" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    const c = comment;
                    setComment(""); 

                    // setCommentsState([...commentsState, {
                    //     id: commentsState.length + 1,
                    //     comment: c,
                    //     userId: user ? user.id : null, // Ensure user.id is defined
                    //     createdAt: new Date(),
                    //     page: pageID,
                    // }])
                    
                    try {
                        await onCommentSubmit(c);
                    } catch (error) {
                        console.error("Error submitting comment:", error);
                    } finally {
                        //setIsSubmitting(false);
                    }
                }}>
                    <input
                        name="comment"
                        placeholder="Add a comment..." 
                        className={CommentSectionCSS.commentTextArea}
                        style={{
                            resize: "none",
                            opacity: isSubmitting ? 0.5 : 1,
                            cursor: isSubmitting ? "not-allowed" : "auto",
                            pointerEvents: isSubmitting ? "none" : "auto"
                        }}
                        required
                        autoComplete="off"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitting} // Disable the textbox when submitting
                    />
                    <div className="flex flex-row justify-end gap-2">
                        {
                            comment.length > 0 && (<>
                                <Btn type="button" onClick={() => setComment("")}>
                                    <p style={{fontSize: "14px", fontWeight: "400"}}>Cancel</p>
                                </Btn>
                                <Btn type="submit" 
                                    style={{
                                        backgroundColor: color || "var(--primary-color)",
                                        transition: "opacity 0.3s ease",
                                        opacity: isSubmitting || comment.length === 0 ? 0.2 : 1,
                                        cursor: isSubmitting || comment.length === 0 ? "not-allowed" : "pointer",
                                        pointerEvents: isSubmitting || comment.length === 0 ? "none" : "auto",
                                        borderRadius: "100px",
                                        paddingLeft: "15px",
                                        paddingRight: "15px",
                                    }} 
                                    disabled={isSubmitting || comment.length === 0}
                                >
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "400",
                                            color: "black",
                                        }}
                                    >
                                        {isSubmitting ? "Submitting..." : "Comment"}
                                    </p>
                                </Btn>
                            </>

                            )
                        }


                    </div>
                </form>
            </div>

            <ul>
                {commentsState.map((comment) => (
                    <CommentItem 
                        key={comment.id}
                        comment={comment}
                        commentUser={comment.user}
                        currentUser={user}
                        owner={owner}
                        onDelete={() => onDeleteComment(comment.id)}
                        isSupporter={comment.isSupporter}
                    />
                ))}
            </ul>
        </div>
    )


    function CommentItem({
        comment,
        commentUser,
        currentUser,
        owner,
        onDelete,
        isSupporter
    }: {
        comment: any;
        commentUser: any;
        currentUser: any;
        owner?: string;
        onDelete: () => Promise<void>;
        isSupporter: boolean;
    }) {
        const relativeDate = format(comment.createdAt)
    
        return (
            <div className="flex flex-row gap-2 rounded-md mb-5">
                <Image src={commentUser.image} alt="User Avatar" width={100} height={100} className={CommentSectionCSS.commentUserAvatar} unoptimized={true}/>
                <div className="flex flex-col">
                    <div className="flex flex-row gap-2">
                        <h1 style={{fontWeight: "600"}}>
                            {commentUser.name}
                            {isSupporter && (
                                <span style={{fontSize: "16px", top: "2px", userSelect: "none"}} className="material-symbols-rounded ml-1 relative" title="Verified">verified</span>
                            )}
                        </h1>
                        <p>{relativeDate}</p>
                    </div>
                    <p>{comment.comment}</p>
                    <div className="flex flex-row gap-2">
                        {currentUser && comment.userId === currentUser.id && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setCommentsState(commentsState.filter(c => c.id !== comment.id));
                                const handleDelete = async () => {
                                    await onDelete();
                                    setCommentsState(commentsState.filter(c => c.id !== comment.id));
                                };
                                handleDelete();
                            }}>
                                <Btn type="submit">Delete</Btn>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )
    }
    
}

