import { useSelector } from "react-redux";
import PostItem from "../PostItem";
import { RootState, useAppDispatch } from "../../../../store";
import { deletePost, getPostList, startEditingPost } from "../../blog.slice";
// import http from "../../../../utils/http";
import { useEffect } from "react";

/**
 * B1: Gọi API trong useEffect
 * B2: nếu gọi thành công thì dispatch action type: "blog/getPostListSuccess"
 *     nếu gọi thất bại thì dispatch action type: "blog/getPostListFailed"
 *
 */

export default function PostList() {
    // useSelector là một hook của react-redux, được sử dụng để lấy dữ liệu từ Redux store trong một functional component của React.
    //lấy dữ liệu để hiển thị lên UI
    const postList = useSelector((state: RootState) => state.blog.postList);
    const dispatch = useAppDispatch();

    //Gọi API trong useEffect
    //Ko sử dụng asynthunk
    // useEffect(() => {
    //     const controller = new AbortController();
    //     http.get("posts", { signal: controller.signal })
    //         .then((response) => {
    //             const postsListResult = response.data;
    //             dispatch({
    //                 type: "blog/getPostListSuccess",
    //                 payload: postsListResult,
    //             });
    //         })
    //         .catch((error) => {
    //             //Nếu lỗi không phải do cancel request bởi abort thì mới dispatch action
    //             if (!(error.code === "ERR_CANCELED")) {
    //                 dispatch({
    //                     type: "blog/getPostListFailed",
    //                     payload: error,
    //                 });
    //             }
    //         });
    //     return () => {
    //         controller.abort();
    //     };
    // }, [dispatch]);

    useEffect(() => {
        const promise = dispatch(getPostList());
        return () => {
            promise.abort();
        };
    }, [dispatch]);

    const handleDelete = (postId: string) => {
        dispatch(deletePost(postId));
    };

    const handleStartEditing = (postId: string) => {
        dispatch(startEditingPost(postId));
    };
    return (
        <div className="bg-white py-6 sm:py-8 lg:py-12">
            <div className="mx-auto max-w-screen-xl px-4 md:px-8">
                <div className="mb-10 md:mb-16">
                    <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl">
                        Được Dev Blog
                    </h2>
                    <p className="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
                        Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở
                        nên tồi tệ. Nhưng ngày mốt sẽ có nắng
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8">
                    {postList.map((post) => (
                        <PostItem
                            post={post}
                            key={post.id}
                            handleDelete={handleDelete}
                            handleStartEditing={handleStartEditing}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
