import json
import pandas as pd
import great_expectations as gx

json_data = """
{
    "name": "John",
    "age":30,
    "city": "New York"
}
"""

data = json.loads(json_data)
df = pd.DataFrame([data])

# create an expectation suite
context = gx.get_context()

# connect to data, connect to existing .csv data stored in Github
validator = context.sources.pandas_default.read_csv("https://raw.githubusercontent.com/great-expectations/gx_tutorials/main/data/yellow_tripdata_sample_2019-01.csv")

# create expectations, running the following command to create two expectations
validator.expect_column_values_to_not_be_null("pickup_datetime")
validator.expect_column_values_to_be_between("passenger_count", auto=True)

validator.save_expectation_suite()

# validate data

## define a checkpoint and examine the data to determine if it matches the defined Expectations

checkpoint = context.add_or_update_checkpoint(
    name="my_quickstart_checkpoint",
    validator=validator,
)

## run the following to return validation results
checkpoint_result = checkpoint.run()

## run the following to view an HTML representation of Validation results
context.view_validation_result(checkpoint_result)

