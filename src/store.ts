// setup reduxtoolkit
// B1

import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./pages/blog/blog.slice";

export const store = configureStore({
    reducer: { blog: blogReducer },
});

// Lấy RootState và AppDispatch từ store
/**
 * RootState: kiểu dữ liệu (Type) đại diện cho toàn bộ state trong redux store
 * store.getState: lấy toàn bộ state hiện tại
 * ReturnType<typeof store.getState> lấy kiểu của toàn bộ state trong store
 * Khi dùng TypeScript, RootState giúp bạn biết được các thuộc tính có trong store, giúp tránh lỗi khi truy xuất state trong các selector.s
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch là kiểu dữ liệu của hàm dispatch trong Redux store.
 * Việc định nghĩa AppDispatch giúp TypeScript kiểm tra kiểu dữ liệu của các action khi dispatch.
 */
export type AppDispatch = typeof store.dispatch;
