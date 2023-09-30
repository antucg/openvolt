# Open Volt Test

- Author: Antonio Carrasco Gonzalez
- Email: antucg@gmail.com

## Getting Started

1. Install dependencies: `npm install`
2. Copy .env.example file and rename it as .env.
    1. Add OPENVOLT_API_KEY and OPENVOLT_METER_ID values
3. Start the server:
    1.  Development mode: `npm dev`
    2. Production mode: `npm run build && npm start`
4. Run tests: `npm test`

## Implementation notes

I have chosen to work with a typescript library called `fp-ts`. This library provides functions and data types that allows the developer to write code following the functional programming paradigm. I chose this because I worked with it in the past and I felt like it was a good choice for this test. The paradigm itself helps me write better code due to its own nature. 

On top of that `fp-ts` is closely related with `io-ts`, a library that implements a runtime type system that allows the developers to verify the integrity of the data when this comes from a third party source.

The entry point of the app can be found under `src/index.ts`. The `initApp()` functions is the main backbone of the application. It loads the necessary data from each of the corresponding API endpoints. Once all the data is available we pass it to the `consumptionCalculatorService` where it is processed in order to render the information according to the description of the exercise.

Once all calculations are done, the processed data is passed to `printService`, which just renders it in a format that I have chosen and I think it is easy to read.

For the sake of simplicity, the data has been accumulated per day. This way, 31 groups of data points are rendered on the terminal, despite the fact that the data that comes from the API endpoints is grouped on intervals of 30 minutes. A quick change on each of the calculator functions could be done in order to change this daily interval.

The validation of the data (as mentined above) has been done thanks to `io-ts` codecs. These codecs (`decode()` function) are used on `carbonIntensityService` and `openVoltService`. If the data we receive from the endpoints don't follow the expected format, the codecs will catch this and warn us about it. This way, we prevent malfunctioning of the application due to missing data points.

## Tests

I have written a few tests of the functions in `consumptionCalculatorService` (`tests/consumptionCalculatorService.test.ts`). This is where most of the logic is implemented. `carbonIntensityService` and `openVoltService` are pretty easy, they laod the data and verify the format is correct. Not much logic is needed for this. `printService` at the moment is just a set of `console.log()` calls so I did't feel the need to test it.

## Improvements

1. Due to some random errors coming from the carbon intensity API (endpoints with same parameters some times work, some times don't), a caching mechanism would be handy if this was a real life application. Given the historical data doesn't change, we could fetch it once and store in a more reliable data store. This way it would always be available when required. We could event format it in a different way if that's what we need to save future computation effort.

2. As mentioned before, the `consumptionCalculatorService` is hardcoded to accumulate data per day. We could extend its functionality, so by passing an extra parameter, we could indicate if we want to keep the 30 minutes or use any other interval of time.

3. At the moment the app is all or nothing. I mean by this that if any endpoint fails, the app will render an error and retry. We could build a more sophisticated solution in which we will retry just the step that failed. However, I skipped this implementation since I think it was out of the scope of the exercise. It seems that during off-peak hours the carbon intensity endpoints are more reliable.
