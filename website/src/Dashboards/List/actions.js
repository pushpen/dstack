// @flow
import api from 'api';
import {getDataFailedRequest} from '@dstackai/dstack-react/dist/utils';
import actionsTypes from './actionsTypes';
import config from 'config';


export const fetchList = (userName, onSuccess: Function) => async (dispatch: Function) => {
    dispatch({type: actionsTypes.FETCH});

    try {
        const request = await api.get(config.DASHBOARD_LIST(userName));

        dispatch({
            type: actionsTypes.FETCH_SUCCESS,
            payload: request.data.dashboards,
        });

        if (onSuccess)
            onSuccess();
    } catch (e) {
        dispatch({
            type: actionsTypes.FETCH_FAIL,
            payload: getDataFailedRequest(e),
        });
    }
};