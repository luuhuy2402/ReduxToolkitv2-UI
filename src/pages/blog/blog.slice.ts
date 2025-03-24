import {
    createAsyncThunk,
    createSlice,
    current,
    PayloadAction,
} from "@reduxjs/toolkit";
import { Post } from "../../types/blog.type";
// import { initalPostList } from "../../constants/blog";
import http from "../../utils/http";

interface BlogState {
    postList: Post[];
    editingPost: Post | null;
}
const initialState: BlogState = {
    //khởi tạo state
    postList: [],
    editingPost: null,
};

export const getPostList = createAsyncThunk(
    "blog/getPostList",
    async (_, thunkAPI) => {
        const response = await http.get<Post[]>("posts", {
            signal: thunkAPI.signal,
        });
        return response.data;
    }
);

export const addPost = createAsyncThunk(
    "blog/addPost",
    //thêm post mới thì cần truyền lên bài post đó (body)
    // id thì json-server sẽ tự sinh ra
    async (body: Omit<Post, "id">, thunkAPI) => {
        const response = await http.post<Post>("posts", body, {
            signal: thunkAPI.signal,
        });
        return response.data;
    }
);

export const updatePost = createAsyncThunk(
    "blog/updatePost",

    async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
        const response = await http.put<Post>(`posts/${postId}`, body, {
            signal: thunkAPI.signal,
        });
        return response.data;
    }
);
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
        // finishEditingPost: (state, action: PayloadAction<Post>) => {
        //     const postId = action.payload.id;
        //     state.postList.some((post, index) => {
        //         if (post.id === postId) {
        //             state.postList[index] = action.payload;
        //             return true; //Dừng lại ngay nếu đã cập nhật
        //         }
        //         return false;
        //     });
        //     state.editingPost = null;
        // },
    },
    extraReducers(builder) {
        builder
            .addCase(getPostList.fulfilled, (state, action) => {
                state.postList = action.payload;
            })
            .addCase(addPost.fulfilled, (state, action) => {
                console.log(action.payload);
                state.postList.push(action.payload);
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.postList.find((post, index) => {
                    if (post.id === action.payload.id) {
                        state.postList[index] = action.payload;
                        return true;
                    }
                    return false;
                });
                state.editingPost = null;
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
    cancelEditingPost,
    deletePost,
    // finishEditingPost,
    startEditingPost,
} = blogSlice.actions;

// export reducer được generate ra từ slice
const blogReducer = blogSlice.reducer;
export default blogReducer;
