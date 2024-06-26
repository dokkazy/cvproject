import React, { useState, memo, useEffect } from 'react'
import { Table, Tag, Space, Button, Flex, Popconfirm, Form, Card, Col, Drawer, Divider, Row, Tooltip, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs';
import { useAuth } from 'react-oidc-context';
import { useDispatch } from 'react-redux';


import EditableCell from '../EditCV/EditableCell';
import { myCVListApi } from '~/api/MyCVListApi';
import handleLogError from '~/utils/HandleError';
import cvListSlice from '~/redux/slices/cvListSlice';
import useResize from '~/hooks/useResize';


const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
        <p className="site-description-item-profile-p-label">{title}:</p>
        {content}
    </div>
);

function CVTable({ dataSource, rowSelection, onChange, onDelete, pagination, loading, editProps }) {
    const auth = useAuth();
    const dispatch = useDispatch();
    const { ref, pageSize } = useResize();
    const [isOpenDrawer, setOpenDrawer] = useState(false);
    const [info, setInfo] = useState({});


    useEffect(() => {
        let size = pageSize;
        if (pageSize < 3) size = 3;
        dispatch(cvListSlice.actions.setPageSize(size));
    }, [dispatch, pageSize]);


    const showDrawer = async (key) => {
        setOpenDrawer(true);
        await myCVListApi.getCvById(key)
            .then((response) => {
                console.log(response.data);
                setInfo(response.data);
            }).catch((error) => {
                handleLogError(error);
            });
    }

    const closeDrawer = () => {
        setOpenDrawer(false);
        setInfo({});
    }

    // Columns and data
    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'full_name',
            key: 'full_name',
            fixed: 'left',
            width: '12%',
            editable: true,
            ellipsis: true,
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
            render(name) {
                return (
                    <Tooltip title={name}>
                        {name}
                    </Tooltip>
                )
            },

        },
        {
            title: 'DOB',
            dataIndex: 'date_of_birth',
            key: 'date_of_birth',
            width: '12%',
            editable: true,
            render: (text) => dayjs(text).format('DD-MM-YYYY'),
            sorter: (a, b) => dayjs(a.date_of_birth).unix() - dayjs(b.date_of_birth).unix(),

        },
        {
            title: 'University',
            dataIndex: 'university',
            key: 'university',
            width: '14%',
            ellipsis: true,
            editable: true,
            sorter: (a, b) => a.university.localeCompare(b.university),
            render(university) {
                return (
                    <Tooltip title={university}>
                        {university}
                    </Tooltip>
                )
            },

        },
        {
            title: 'Training System',
            dataIndex: 'training_system',
            key: 'training_system',
            width: '12%',
            editable: true,
            ellipsis: true,
            sorter: (a, b) => a.training_system.localeCompare(b.training_system),

        },
        {
            title: 'GPA',
            dataIndex: 'gpa',
            key: 'gpa',
            width: '8%',
            editable: true,
            sorter: (a, b) => a.gpa - b.gpa,

        },
        {
            title: 'Apply Position',
            dataIndex: 'apply_position',
            key: 'apply_position',
            width: '12%',
            editable: true,
            ellipsis: true,
            sorter: (a, b) => a.apply_position.localeCompare(b.apply_position),
            render(position) {
                return (
                    <Tooltip title={position}>
                        {position}
                    </Tooltip>
                )
            },

        },
        {
            title: 'Skills',
            dataIndex: 'skill',
            key: 'skill',
            width: '14%',
            editable: true,
            ellipsis: true,
            render: (text) => {
                const split = text.split(',');
                const result = split.map((item) => item = item.trim()).slice(0, 3);
                const remaining = split.length - 3;
                return (
                    <>
                        <Flex gap={'4px'} wrap='wrap'>
                            {result.map((item, index) => {
                                return (
                                    <Tag key={index} color={'purple'}>
                                        {item.toUpperCase()}
                                    </Tag>
                                )
                            })}
                            {remaining > 0 && (
                                <Tooltip title={remaining === 1 ? `+ ${remaining} skill` : `+ ${remaining} skills`}>
                                    <Tag color={'blue'}>+{remaining}</Tag>
                                </Tooltip>
                            )}
                        </Flex>
                    </>
                )
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render(status) {
                let color;
                switch (status) {
                    case 'PASS':
                        color = 'green';
                        break;
                    case 'NOTPASS':
                        color = 'red';
                        break;
                    default:
                        color = 'purple';
                        break;
                }

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                )
            },
            ellipsis: true,
        },
        {
            title: 'Link CV',
            dataIndex: 'link_cv',
            key: 'link_cv',
            width: '10%',
            render(link) {
                return (
                    <Tooltip title={link}>
                        <a href={link}>{link}</a>
                    </Tooltip>
                )
            },
            editable: true,
            ellipsis: true,

        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 150,
            align: 'center',
            render: (_, record) => {
                const editable = editProps.isEditing(record);
                return (

                    <Space size="middle">
                        {editable ? (
                            <>
                                <Popconfirm title="Are you sure?" onConfirm={() => editProps.save(record.key)}>
                                    <Button icon={<SaveOutlined />} type="primary">
                                    </Button>
                                </Popconfirm>
                                <Button danger icon={<CloseCircleOutlined />} onClick={editProps.cancel}></Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    icon={<EditOutlined />}
                                    disabled={editable === ''}
                                    onClick={() => editProps.edit(record)}
                                    type='primary' shape='circle'></Button>
                                <Button
                                    icon={<DeleteOutlined />}
                                    type='default' shape='circle'
                                    danger onClick={() => onDelete(record.key)}></Button>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => showDrawer(record.key)}
                                ></Button>

                            </>
                        )}
                    </Space>
                );
            },

        },
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'gpa' ? 'number' : col.dataIndex === 'date_of_birth' ? 'date' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: editProps.isEditing(record),
            }),
        };
    });
    const cvs = () => {
        if (dataSource === undefined || dataSource === null) return [];
        return dataSource.map((cv) => ({
            key: cv.id,
            skill: cv.skill,
            university: cv.university,
            gpa: cv.gpa,
            status: cv.status,
            full_name: cv.full_name,
            date_of_birth: cv.date_of_birth,
            training_system: cv.training_system,
            create_by: cv.create_by,
            apply_position: cv.apply_position,
            link_cv: cv.link_cv
        }));
    }

    const datas = cvs();

    return (
        <>
            <Card className='shadow-lg'>
                <Form form={editProps.form} component={false} colon>
                    <Table
                        rootClassName='cv-table'
                        rowSelection={rowSelection}
                        dataSource={datas}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        onChange={onChange}
                        scroll={{
                            scrollToFirstRowOnChange: false,
                            x: 1600,
                            // y: 420
                        }}
                        showSorterTooltip={{
                            target: 'sorter-icon',
                        }}
                        pagination={false}
                        loading={loading}
                    />
                    <div ref={ref}>
                        <Flex className='mt-4 pagination' justify='center'>
                            <Pagination {...pagination} />
                        </Flex>
                    </div>
                </Form>
            </Card>

            <Drawer width={640} placement="right" closable={false} onClose={closeDrawer} open={isOpenDrawer}>
                <p
                    className="site-description-item-profile-p"
                    style={{
                        marginBottom: 24,
                    }}
                >
                    User Profile
                </p>
                <p className="site-description-item-profile-p">Personal</p>
                <Row>
                    <Col span={12}>
                        <DescriptionItem title="Full Name" content={info.fullName} />
                    </Col>
                    <Col span={12}>
                        <DescriptionItem title="Birthday" content={dayjs(info.dateOfBirth).format('DD-MM-YYYY')} />
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <DescriptionItem title="University" content={info.university} />
                    </Col>
                    <Col span={12}>
                        <DescriptionItem title="GPA" content={info.gpa} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem title="Training System" content={info.trainingSystem} />
                    </Col>
                </Row>
                <Divider />
                <p className="site-description-item-profile-p">Company</p>
                <Row>
                    <Col span={24}>
                        <DescriptionItem title="Position" content={info.applyPosition} />
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <DescriptionItem title="Supervisor" content={auth.user?.profile.preferred_username} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem
                            title="Skills"
                            content={info.skill}
                        />
                    </Col>
                </Row>
                <Divider />
                <p className="site-description-item-profile-p">Contacts</p>
                <Row>
                    <Col span={24}>
                        <DescriptionItem
                            title="CV"
                            content={
                                <a href={info.linkCV}>
                                    {info.linkCV}
                                </a>
                            }
                        />
                    </Col>
                </Row>
            </Drawer>
        </>
    )
}

export default memo(CVTable)