// @flow

import React, {useEffect, useState, useRef, Fragment} from 'react';
import {get} from 'lodash-es';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {useHistory, useLocation, useParams} from 'react-router';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {AccessForbidden, NotFound, StackDetails, StackUpload} from '@dstackai/dstack-react';
import {isSignedIn, parseSearch} from '@dstackai/dstack-react/dist/utils';
import {deleteStack} from 'Stacks/List/actions';
import {fetchDetails, clearDetails, fetchFrame, downloadAttachment, update} from './actions';
import routes from 'routes';
import config from 'config';

type Props = {
    attachmentRequestStatus: ?number,
    deleteStack: Function,
    fetchDetails: Function,
    fetchFrame: Function,
    clearDetails: Function,
    update: Function,
    requestStatus: ?number,
    frame: ?{},
    listData?: {},
    data?: {},
    frameRequestStatus: ?number,
    loadingFrame?: boolean,
    currentUser?: string,
    currentUserToken?: string,
}

const Details = ({
    fetchDetails,
    fetchFrame,
    downloadAttachment,
    clearDetails,
    update,
    data = {},
    listData = {},
    frame,
    frameRequestStatus,
    loading,
    requestStatus,
    currentUser,
    currentUserToken,
}: Props) => {
    let parsedAttachmentIndex;

    const params = useParams();
    const {push} = useHistory();
    const location = useLocation();
    const searchParams = parseSearch(location.search);

    if (searchParams.a)
        parsedAttachmentIndex = parseInt(searchParams.a);

    const [attachmentIndex, setAttachmentIndex] = useState(parsedAttachmentIndex);
    const [selectedFrame, setSelectedFrame] = useState(searchParams.f);
    const [headId, setHeadId] = useState(null);

    const {t} = useTranslation();

    const [isShowUploadModal, setIsShowUploadModal] = useState(false);
    const isFirstChangeSearch = useRef(false);

    const downloadAttachmentHandle = () => {
        downloadAttachment(`${params.user}/${params.stack}`, selectedFrame || headId, attachmentIndex || 0);
    };

    useEffect(() => {
        if (isFirstChangeSearch.current) {
            let parsedAttachmentIndex;

            if (searchParams.a)
                parsedAttachmentIndex = parseInt(searchParams.a);

            if (parsedAttachmentIndex !== attachmentIndex)
                setAttachmentIndex(parsedAttachmentIndex);

            if (searchParams.f !== selectedFrame)
                setSelectedFrame(searchParams.f);

        } else {
            isFirstChangeSearch.current = true;
        }
    }, [location.search]);

    useEffect(() => {
        let searchParams = {};

        if (attachmentIndex)
            searchParams.a = attachmentIndex;

        if (selectedFrame && selectedFrame !== headId)
            searchParams.f = selectedFrame;

        const searchString = Object
            .keys(searchParams)
            .map(key => `${key}=${searchParams[key]}`)
            .join('&');

        if (location.search.replace('?', '') !== searchString)
            push({search: searchString.length ? `?${searchString}` : ''});
    }, [attachmentIndex, selectedFrame, headId]);

    const fetchData = () => {
        fetchDetails(params.user, params.stack);
    };

    useEffect(() => {
        if (!data.head || !listData || (data.head.id !== listData.head))
            fetchData();

        return () => clearDetails();
    }, [params.user, params.stack]);

    const setHeadFrame = frameId => {
        update({
            stack: `${data.user}/${data.name}`,
            noUpdateStore: true,
            head: frameId,
        }, () => setHeadId(frameId));
    };

    useEffect(() => {
        if (selectedFrame)
            fetchFrame(params.user, params.stack, selectedFrame);
    }, [selectedFrame]);

    useEffect(() => {
        if (data && data.head)
            setHeadId(data.head.id);
    }, [data]);

    const onChangeFrame = frameId => {
        setSelectedFrame(frameId);
        setAttachmentIndex(undefined);
    };

    const toggleUploadModal = () => setIsShowUploadModal(!isShowUploadModal);

    if (!loading && requestStatus === 403)
        return <AccessForbidden>
            {t('youDontHaveAnAccessToThisStack')}.

            {isSignedIn() && (
                <Fragment>
                    <br />

                    <Link to={routes.stacks(currentUser)}>
                        {t('goToMyStacks')}
                    </Link>
                </Fragment>
            )}
        </AccessForbidden>;

    if (!loading && (requestStatus === 404 || frameRequestStatus === 404))
        return <NotFound>
            {t('theStackYouAreRookingForCouldNotBeFound')}
            {' '}
            {isSignedIn() && (
                <Fragment>
                    <Link to={routes.stacks(currentUser)}>
                        {t('goToMyStacks')}
                    </Link>.
                </Fragment>
            )}
        </NotFound>;

    const currentFrameId = selectedFrame ? selectedFrame : get(data, 'head.id');

    return (
        <Fragment>
            <Helmet>
                <title>dstack.ai | {params.user} | {params.stack}</title>
            </Helmet>

            <StackDetails
                loading={loading}
                currentFrameId={currentFrameId}
                frame={frame}
                attachmentIndex={attachmentIndex || 0}
                data={data}
                frameRequestStatus={frameRequestStatus}
                currentUser={currentUser}
                currentUserToken={currentUserToken}
                toggleUpload={toggleUploadModal}
                backUrl={routes.stacks(params.user)}
                user={params.user}
                stack={params.stack}
                onChangeFrame={onChangeFrame}
                onChangeHeadFrame={setHeadFrame}
                onChangeAttachmentIndex={setAttachmentIndex}
                downloadAttachment={downloadAttachmentHandle}
            />

            <StackUpload
                stack={params.stack}
                isShow={isShowUploadModal}
                onClose={() => setIsShowUploadModal(false)}
                refresh={fetchData}
                apiUrl={config.API_URL}
                user={params.user}
            />
        </Fragment>
    );
};

export default connect(
    (state, props) => {
        const frame = state.stacks.details.frame;
        const stack = props.location.pathname.replace(/^\//, '');

        return {
            data: get(state.stacks.details.data, stack),
            listData: state.stacks.list.data && state.stacks.list.data.find(i => `${i.user}/${i.name}` === stack),
            requestStatus: state.stacks.details.requestStatus,
            frame,
            frameRequestStatus: state.stacks.details.frameRequestStatus,
            loadingFrame: state.stacks.details.loadingFrame,
            attachmentRequestStatus: state.stacks.details.attachmentRequestStatus,
            loading: state.stacks.details.loading,
            currentUser: state.app.userData?.user,
            currentUserToken: state.app.userData?.token,
        };
    },

    {
        fetchDetails,
        clearDetails,
        deleteStack,
        fetchFrame,
        update,
        downloadAttachment,
    },
)(Details);
