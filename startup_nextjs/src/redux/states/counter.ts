import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from "reselect";

import { RootState, MyAction } from "redux/store";


export interface CounterState {
    count: number
    callCount: number
}
const initialState: CounterState = {
    count: 0,
    callCount: 0,
}

//slice
export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        add: (state, action: MyAction<number>) => {
            if (Number.isNaN(action.payload)) return
            state.count += action.payload
            state.callCount += 1
        },
        sub: (state, action) => {
            if (Number.isNaN(action.payload)) return
            state.count -= action.payload
            state.callCount += 1
        },
    },
})

//reducer
export const counterReducer = counterSlice.reducer

//action
export const counterAction = counterSlice.actions

//selector
export const counterSelector = (state: RootState) => state.counter;
export const countSelector = createSelector(counterSelector, (counter) => {
    return counter.count;
});
export const callCountSelector = createSelector(counterSelector, (counter) => {
    return counter.callCount;
});

