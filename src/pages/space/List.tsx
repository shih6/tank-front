import React from 'react';
import TankComponent from '../../common/component/TankComponent';
import { RouteComponentProps } from 'react-router-dom';
import Pager from '../../common/model/base/Pager';
import Space, { SpaceFormValues } from '../../common/model/space/Space';
import {
  Button,
  Card,
  Col,
  Pagination,
  Progress,
  Row,
  Tooltip,
  Space as AntdSpace,
  Modal,
} from 'antd';
import './List.less';
import Lang from '../../common/model/global/Lang';
import ModalForm from './widget/ModalForm';
import TankTitle from '../widget/TankTitle';
import FileUtil from '../../common/util/FileUtil';
import MessageBoxUtil from '../../common/util/MessageBoxUtil';
import {
  EditOutlined,
  ExclamationCircleFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons/lib';
import Color from '../../common/model/base/option/Color';
import SafeUtil from '../../common/util/SafeUtil';

interface IProps extends RouteComponentProps {}

interface IState {}
export default class List extends TankComponent<IProps, IState> {
  pager = new Pager<Space>(this, Space, Pager.MAX_PAGE_SIZE);
  modalState: {
    visible: boolean;
    mode: 'create' | 'edit';
    initialValues?: SpaceFormValues;
  } = {
    visible: false,
    mode: 'create',
  };

  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    this.pager.enableHistory();
    this.pager.httpList();
  }

  changePage(page: number) {
    this.pager.page = page - 1; // page的页数0基
    this.pager.httpList();
    this.updateUI();
  }

  handleCreate() {
    this.modalState = {
      visible: true,
      mode: 'create',
    };
    this.updateUI();
  }

  handleEdit(space: Space) {
    this.modalState = {
      visible: true,
      mode: 'edit',
      initialValues: space.getForm(),
    };
    this.updateUI();
  }

  handleConfirmModalForm(values: SpaceFormValues) {
    const space = new Space();
    space.assign(values);
    space.httpSave(
      () => {
        MessageBoxUtil.success(Lang.t('operationSuccess'));
        this.pager.httpList();
      },
      null,
      () => this.handleHideModalForm()
    );
  }

  handleHideModalForm() {
    this.modalState = {
      ...this.modalState,
      visible: false,
    };
    this.updateUI();
  }

  handleDelete(space: Space) {
    Modal.confirm({
      title: Lang.t('space.deleteHint'),
      icon: <ExclamationCircleFilled twoToneColor={Color.WARNING} />,
      cancelText: Lang.t('cancel'),
      okText: Lang.t('confirm'),
      onOk: () => {
        space.httpDel(() => {
          MessageBoxUtil.success(Lang.t('operationSuccess'));
          this.pager.httpList();
        });
      },
    });
  }
  handleSpaceMember(space: Space) {
    this.props.history.push(`/space/${space.uuid}/member`);
  }

  handleSpaceMatterList(space: Space) {
    this.props.history.push(`/space/${space.uuid}/matter/list`);
  }

  render() {
    const { pager, modalState } = this;

    return (
      <div className="page-space-list">
        <TankTitle name={Lang.t('space.name')}>
          <Button type="primary" onClick={() => this.handleCreate()}>
            {Lang.t('space.create')}
          </Button>
        </TankTitle>

        <Row gutter={[10, 10]}>
          {pager.data.map((space) => {
            const percent = space.totalSize! / space.totalSizeLimit!;

            return (
              <Col xs={24} sm={24} md={12} lg={8} key={space.uuid}>
                <Card
                  className="space-item"
                  size="small"
                  onClick={() => this.handleSpaceMatterList(space)}
                >
                  <div className="space-item-name-wrapper mb10">
                    <div
                      className="space-item-name one-line"
                      title={space.name!}
                    >
                      {space.name}
                    </div>
                    <AntdSpace className="space-item-icons">
                      <TeamOutlined
                        className="btn-action btn-member"
                        onClick={(e) =>
                          SafeUtil.stopPropagationWrap(e)(
                            this.handleSpaceMember(space)
                          )
                        }
                      />
                      <EditOutlined
                        className="btn-action btn-edit"
                        onClick={(e) =>
                          SafeUtil.stopPropagationWrap(e)(
                            this.handleEdit(space)
                          )
                        }
                      />
                      <DeleteOutlined
                        className="btn-action btn-del"
                        onClick={(e) =>
                          SafeUtil.stopPropagationWrap(e)(
                            this.handleDelete(space)
                          )
                        }
                      />
                    </AntdSpace>
                  </div>
                  <div className="space-item-percent">
                    <Tooltip
                      title={
                        <>
                          <div>
                            {Lang.t('space.sizeLimit')}：
                            {FileUtil.humanFileSize(space.sizeLimit!)}
                          </div>
                          <div>
                            {Lang.t('space.totalSize')}：
                            {FileUtil.humanFileSize(space.totalSize!)}
                          </div>
                          <div>
                            {Lang.t('space.totalSizeLimit')}：
                            {FileUtil.humanFileSize(space.totalSizeLimit!)}
                          </div>
                        </>
                      }
                    >
                      <Progress percent={Math.round(percent * 100)} />
                    </Tooltip>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Pagination
          className="space-pagination pull-right"
          onChange={this.changePage.bind(this)}
          current={pager.page + 1}
          total={pager.totalItems}
          pageSize={pager.pageSize}
          hideOnSinglePage
        />
        {modalState.visible && (
          <ModalForm
            mode={modalState.mode}
            initialValues={modalState.initialValues}
            onOk={this.handleConfirmModalForm.bind(this)}
            onCancel={() => this.handleHideModalForm()}
          />
        )}
      </div>
    );
  }
}
