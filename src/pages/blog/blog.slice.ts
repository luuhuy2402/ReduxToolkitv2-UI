import {
    AsyncThunk,
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import { Post } from "../../types/blog.type";
// import { initalPostList } from "../../constants/blog";
import http from "../../utils/http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;

type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;
interface BlogState {
    postList: Post[];
    editingPost: Post | null;
    loading: boolean;
    currentRequestId: undefined | string;
}
const initialState: BlogState = {
    //khởi tạo state
    postList: [],
    editingPost: null,
    loading: false,
    currentRequestId: undefined,
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
        try {
            const response = await http.post<Post>("posts", body, {
                signal: thunkAPI.signal,
            });
            return response.data;
        } catch (error: any) {
            if (error.name === "AxiosError" && error.response?.status === 422) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
            throw error;
        }
    }
);

export const updatePost = createAsyncThunk(
    "blog/updatePost",

    async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
        try {
            const response = await http.put<Post>(`posts/${postId}`, body, {
                signal: thunkAPI.signal,
            });
            return response.data;
        } catch (error: any) {
            if (error.name === "AxiosError" && error.response?.status === 422) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
            throw error;
        }
    }
);

export const deletePost = createAsyncThunk(
    "blog/deletePost",
    async (postId: string, thunkAPI) => {
        const response = await http.delete<string>(`posts/${postId}`, {
            signal: thunkAPI.signal,
        });
        return response.data;
    }
);
const blogSlice = createSlice({
    name: "blog", // Đây là prefix cho action type
    initialState,
    reducers: {
        startEditingPost: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const foundPost =
                state.postList.find((post) => post.id === postId) || null;

            state.editingPost = foundPost;
        },
        cancelEditingPost: (state) => {
            state.editingPost = null;
        },
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
            .addCase(deletePost.fulfilled, (state, action) => {
                //vì khi gọi api delete thì server sẽ trả về 1 thông báo hoặc {} nên ta ko lất action.payload được
                const postId = action.meta.arg;
                const deletePostIndex = state.postList.findIndex(
                    (post) => post.id === postId
                );
                if (deletePostIndex !== -1) {
                    state.postList.splice(deletePostIndex, 1);
                }
            })
            .addMatcher<PendingAction>(
                (action) => action.type.endsWith("/pending"),
                (state, action) => {
                    state.loading = true;
                    //Khi gọi api bất kì thì createAsyncThunk sẽ tự sinh ra requestId
                    state.currentRequestId = action.meta.requestId;
                }
            )

            .addMatcher<RejectedAction | FulfilledAction>(
                (action) =>
                    action.type.endsWith("/rejected") ||
                    action.type.endsWith("/fulfilled"),
                (state, action) => {
                    if (
                        state.loading &&
                        state.currentRequestId === action.meta.requestId
                    ) {
                        state.loading = false;
                        state.currentRequestId = undefined;
                    }
                }
            )
            // .addMatcher<FulfilledAction>(
            //     (action) => action.type.endsWith("/fulfilled"),
            //     (state, action) => {
            //         if (
            //             state.loading &&
            //             state.currentRequestId === action.meta.requestId
            //         ) {
            //             state.loading = false;
            //             state.currentRequestId = undefined;
            //         }
            //     }
            // )
            .addDefaultCase((state) => {
                console.log(state);
            });
    },
});

// export action được generate ra từ slice
export const { cancelEditingPost, startEditingPost } = blogSlice.actions;

// export reducer được generate ra từ slice
const blogReducer = blogSlice.reducer;
export default blogReducer;
