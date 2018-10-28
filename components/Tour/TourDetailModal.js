import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Form, Input, Icon, DatePicker, Upload } from 'antd';
import moment from 'moment';

import { allowSpecificDates, getTourStartDate, getCurrentTour } from '../../Helper/Helper';
import { toggleTourDetailModal, addTourDetail, updateTourDetail } from '../../store/actions';

const FormItem = Form.Item;
class TourDetailModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tour_detail: '',
			title: '',
			image: '',
			date: moment(getTourStartDate()),
			is_new: true,
			fileList: [],
			modalState: false,
			metafields: ''
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.tour_detail !== null) {
			this.setState({
				title: nextProps.tour_detail.title,
				date: nextProps.tour_detail.metadata.date,
				is_new: false,
				modalState: nextProps.toggleTourDetailModalState,
				tour_detail: nextProps.tour_detail,
				metafields: nextProps.tour_detail.metafields
			});
		} else {
			this.setState({
				modalState: nextProps.toggleTourDetailModalState
			});
		}
	}

	onKeyPress = e => {
		if (e.keyCode === 13) {
			this.handleSubmit();
		} else if (e.keyCode === 27) {
			this.handleClose();
		}
	};

	handleClose = () => {
		this.setState({
			tour_detail: '',
			title: '',
			image: '',
			date: moment(getTourStartDate()),
			is_new: true,
			fileList: [],
			modalState: this.props.toggleTourDetailModalState,
			metafields: ''
		});
		this.props.form.resetFields();
		this.props.onToggleTourDetailModal();
	};

	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, fieldsValue) => {
			if (!err) {
				const tour = getCurrentTour();
				const values = {
					...fieldsValue,
					date: fieldsValue.date.format('YYYY-MM-DD'),
					tourId: tour._id,
					tour_detail: this.state.tour_detail,
					metafields: this.state.metafields
				};
				if (this.state.is_new === true) {
					this.props.onTourDetailFormSubmit(values);
				} else {
					this.props.onTourDetailUpdateFormSubmit(values);
				}

				this.handleClose();
			}
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 4 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 20 }
			}
		};

		const fileProps = {
			action: '',
			onRemove: file => {
				this.setState(({ fileList }) => {
					const index = fileList.indexOf(file);
					const newFileList = fileList.slice();
					newFileList.splice(index, 1);
					return {
						fileList: newFileList
					};
				});
			},
			beforeUpload: file => {
				if (this.state.fileList.length === 0) {
					this.setState(({ fileList }) => ({
						fileList: [...fileList, file]
					}));
					return false;
				}
			},
			fileList: this.state.fileList,
			accept: 'images/*',
			supportServerRender: true,
			name: 'image'
		};

		return (
			<div>
				<Modal
					title="Add New Image"
					width="60%"
					visible={this.state.modalState}
					onOk={this.handleSubmit}
					okText="Add"
					onCancel={this.handleClose}
					onKeyPress={this.onKeyPress}
				>
					<Form layout="vertical">
						<FormItem {...formItemLayout} label={<span>Caption</span>}>
							{getFieldDecorator('title', {
								initialValue: this.state.title,
								rules: [
									{
										required: true,
										message: 'Please enter image caption',
										whitespace: true
									}
								]
							})(<Input name="title" />)}
						</FormItem>
						<FormItem {...formItemLayout} label={<span>Date</span>}>
							{getFieldDecorator('date', {
								initialValue:
									this.props.tour_detail !== null
										? moment(this.state.tour_detail.metadata.date)
										: moment(getTourStartDate()),
								rules: [
									{
										type: 'object',
										required: true,
										message: 'Please enter date'
									}
								]
							})(<DatePicker disabledDate={allowSpecificDates} name="date" />)}
						</FormItem>

						<FormItem {...formItemLayout} label="Image">
							{getFieldDecorator('image', {
								rules: [
									{
										required: !!this.state.is_new,
										message: 'Please select image'
									}
								]
							})(
								<Upload name="image" {...fileProps}>
									<Button>
										<Icon type="upload" /> Select File
									</Button>
								</Upload>
							)}
						</FormItem>
					</Form>
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	toggleTourDetailModalState: state.toggleTourDetailModal,
	tour_detail: state.tour_detail
});

const mapDispatchToProps = dispatch => ({
	onToggleTourDetailModal: () => dispatch(toggleTourDetailModal()),
	onTourDetailFormSubmit: payloadData => dispatch(addTourDetail(payloadData)),
	onTourDetailUpdateFormSubmit: payloadData => dispatch(updateTourDetail(payloadData))
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(TourDetailModal));
