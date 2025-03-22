import { createSlice, current, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../types/blog.type";
import { initalPostList } from "../../constants/blog";

interface BlogState {
    postList: Post[];
    editingPost: Post | null;
}
const initialState: BlogState = {
    //khởi tạo state
    postList: [],
    editingPost: null,
};

const blogSlice = createSlice({
    name: "blog", // Đây là prefix cho action type
    initialState,
    reducers: {
        deletePost: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const foundPostIndex = state.postList.findIndex(
                (post) => post.id === postId
            );
            if (foundPostIndex !== -1) {
                state.postList.splice(foundPostIndex, 1);
            }
        },
        startEditingPost: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const foundPost =
                state.postList.find((post) => post.id === postId) || null;

            state.editingPost = foundPost;
        },
        cancelEditingPost: (state) => {
            state.editingPost = null;
        },
        finishEditingPost: (state, action: PayloadAction<Post>) => {
            const postId = action.payload.id;
            state.postList.some((post, index) => {
                if (post.id === postId) {
                    state.postList[index] = action.payload;
                    return true; //Dừng lại ngay nếu đã cập nhật
                }
                return false;
            });
            state.editingPost = null;
        },
        addPost: {
            reducer: (state, action: PayloadAction<Post>) => {
                const post = action.payload;
                state.postList.push(post);
            },
            prepare: (post: Omit<Post, "id">) => {
                return {
                    payload: {
                        ...post,
                        id: nanoid(),
                    },
                };
            },
        },
    },
    extraReducers(builder) {
        builder
            .addCase("blog/getPostListSuccess", (state, action: any) => {
                state.postList = action.payload;
            })
            .addMatcher(
                (action) => action.type.includes("cancel"), //nếu trả về true thì hàm sau sẽ chạy
                (state) => {
                    console.log(current(state));
                }
            )

            .addDefaultCase((state) => {
                console.log(state);
            });
    },
});

// export action được generate ra từ slice
export const {
    addPost,
    cancelEditingPost,
    deletePost,
    finishEditingPost,
    startEditingPost,
} = blogSlice.actions;

// export reducer được generate ra từ slice
const blogReducer = blogSlice.reducer;
export default blogReducer;
