import { setRequiredKeysAfterDeserialize } from './init.module';

describe('init module setRequiredKeysAfterDeserialize', () => {

	it('should keep data when existing', () => {
		const obj = {};
		obj['daysForecast'] = 'daysForecast';
		obj['popupType'] = 'popupType';
		obj['selectedCityId'] = 'selectedCityId';
		obj['showDetailTimeSlotBgPicture'] = 'showDetailTimeSlotBgPicture';
		const data = setRequiredKeysAfterDeserialize(obj, 'status');
		expect(data['daysForecast']).toBeDefined();
		expect(data['popupType']).toBeDefined();
		expect(data['selectedCityId']).toBeDefined();
		expect(data['showDetailTimeSlotBgPicture']).toBeDefined();
	});


	it('should set default when data non existing', () => {
		const obj = {};
		obj['daysForecast'] = undefined;
		obj['popupType'] = undefined;
		obj['selectedCityId'] = undefined;
		obj['showDetailTimeSlotBgPicture'] = undefined;
		const data = setRequiredKeysAfterDeserialize(obj, 'status');
		expect(data['daysForecast']).toBeDefined();
		expect(data['popupType']).toBeDefined();
		expect(data['selectedCityId']).toBeDefined();
		expect(data['showDetailTimeSlotBgPicture']).toBeDefined();
	});

	it('should set default when data non existing', () => {
		const obj = {};
		const data = setRequiredKeysAfterDeserialize(obj, null);
		expect(data['daysForecast']).toBeUndefined();
		expect(data['showDetailTimeSlotBgPicture']).toBeUndefined();
	});

});
