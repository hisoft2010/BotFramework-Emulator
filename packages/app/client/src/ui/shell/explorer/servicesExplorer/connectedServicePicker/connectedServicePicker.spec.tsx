import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { ConnectedServicePicker } from './connectedServicePicker';
import { ConnectedServicePickerContainer } from './connectedServicePickerContainer';
import bot from '../../../../../data/reducer/bot';
import { load, setActive } from '../../../../../data/action/botActions';
import { DialogService } from '../../../../dialogs/service';
import { ServiceTypes } from 'botframework-config/lib/schema';

jest.mock('./connectedServicePicker.scss', () => ({}));
jest.mock('../../../../dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

describe('The ConnectedServicePicker component', () => {
  let parent;
  let node;
  let mockStore;
  let mockBot;
  let mockService;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot }));
    mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "secretKey": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockService = { ...mockBot.services[0] };
    mockService.id = 'mock';

    parent = mount(<Provider store={ mockStore }>
      <ConnectedServicePickerContainer availableServices={ [mockService] } authenticatedUser="bot@bot.com"/>
    </Provider>);
    node = parent.find(ConnectedServicePicker);
  });

  it('should render deeply', () => {
    expect(parent.find(ConnectedServicePickerContainer)).not.toBe(null);
    expect(parent.find(ConnectedServicePicker)).not.toBe(null);
  });

  it('should contain the expected functions in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).launchServiceEditor).toBe('function');
    expect(typeof (node.props() as any).connectServices).toBe('function');
  });

  it('should update the state when a checkbox is clicked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBe(false);
    instance.onChange(mockService);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should update the state when the check all checkbox is checked', () => {
    const instance = node.instance();
    expect(instance.state.mock).toBe(false);
    expect(instance.state.checkAllChecked).toBeFalsy();

    instance.onSelectAllChange(null);
    expect(instance.state.mock).not.toBeUndefined();
    expect(instance.state.checkAllChecked).toBeTruthy();
  });

  it('should exit with a response of 0 when cancel or close is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should exit with a response of 1 when adding a model manually', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.launchServiceEditor();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should exit with the list of models to add when the user clicks "add"', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.state.mock = mockService;
    instance.onAddClick(null);

    expect(spy).toHaveBeenCalledWith([mockService]);
  });

  it('should disable the "Add" button when no models have been selected', () => {
    const instance = node.instance();
    expect(instance.addButtonEnabled).toBeFalsy();
  });

  describe('getDerivedStateFromProps', () => {
    it('should update the state correctly when both connected and available services exist', () => {
      const state = ConnectedServicePicker.getDerivedStateFromProps(
        {
          connectedServices: [{ id: 'testId777' }],
          availableServices: [{ id: 'testId123' }]
        } as any,
        {
          testId777: 'connected'
        } as any);
      expect(state.testId123).toBe(false);
    });
  });

  describe('should render the expected content when', () => {

    it('ServiceTypes.Luis is passed into the props', () => {
      parent = mount(<Provider store={ mockStore }>
        <ConnectedServicePickerContainer availableServices={ [mockService] }
                                         authenticatedUser="bot@bot.com" serviceType={ ServiceTypes.Luis }/>
      </Provider>);
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.luisServiceHeader);
      expect(node.contentElements).toBe(node.luisServiceContent);
    });

    it('ServiceTypes.Dispatch is passed into the props', () => {
      parent = mount(<Provider store={ mockStore }>
        <ConnectedServicePickerContainer availableServices={ [mockService] }
                                         authenticatedUser="bot@bot.com" serviceType={ ServiceTypes.Dispatch }/>
      </Provider>);
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.dispatchServiceHeader);
      expect(node.contentElements).toBe(node.dispatchServiceContent);
    });

    it('ServiceTypes.QnA is passed into the props', () => {
      parent = mount(<Provider store={ mockStore }>
        <ConnectedServicePickerContainer availableServices={ [mockService] }
                                         authenticatedUser="bot@bot.com" serviceType={ ServiceTypes.QnA }/>
      </Provider>);
      node = parent.find(ConnectedServicePicker);

      expect(node.headerElements).toBe(node.qnaServiceHeader);
      expect(node.contentElements).toBe(node.qnaServiceContent);
    });
  });
});
