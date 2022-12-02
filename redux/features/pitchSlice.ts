import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Pitch } from '../../Models'

export interface CounterState {
  pitch: Pitch | {}
}

const initialState: CounterState = {
    pitch: {}
}

export const pitchSlice = createSlice({
  name: 'pitch',
  initialState,
  reducers: {
    setPitch: (state, action) => {
       state.pitch = action.payload
    },
  
  },
})

// Action creators are generated for each case reducer function
export const { setPitch } = pitchSlice.actions

export default pitchSlice.reducer