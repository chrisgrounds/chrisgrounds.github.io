---
layout: post
title: "Generate Random Data in Rust"
date: 2023-03-17
published: true
tags: ["rust", "random"]
---

Are you looking to generate random data for testing or demo purposes? Look no further than Rust, a systems programming language that provides excellent memory safety and performance. In this tutorial, we’ll walk through the steps of using Rust’s rand::distributions library to generate random sensor data and write it to a CSV file.

## Randomly generated data in csv format

First, let’s create a new Rust project by running cargo new random-sensor-data. This will create a new directory with the basic structure of a Rust project.

Next, we need to add some dependencies to our project. Open the Cargo.toml file and add the following lines:

```toml
[dependencies]
rand = "0.8.4"
serde = { version = "1.0", features = ["derive"] }
strum = "0.19.10"
strum_macros = "0.19.10"
csv = "1.1.7"
```

These dependencies will allow us to generate random numbers, serialize and deserialize data, define enums with string representations, and write to CSV files.

Now, let’s create a new Rust file called event_data.rs. In this file, we'll define a new data type called EventData that represents a sensor event. We'll also define an enum called EventType that represents the different types of sensor events.

```rust
use rand::distributions::{Distribution, Standard};
use rand::Rng;
use serde::Serialize;
use strum::EnumCount;
use strum_macros::{EnumCount as EnumCountMacro, EnumIter};

#[derive(Debug, EnumCountMacro, EnumIter, Serialize)]
pub enum EventType {
    SensorTriggered,
    SensorAcknowledged,
    SensorOff,
}

#[derive(Debug, Serialize)]
pub struct EventData {
    pub event_type: EventType,
    pub timestamp: u64,
    pub correlation_id: u64,
}
```

## Defining the Distribution Implementation for EventData

Now that we’ve defined our EventData type and its possible variants, we need to tell Rust how to randomly generate data for this type. We can do this by implementing the Distribution trait from the rand crate.

We’ll start by defining our implementation of the Distribution trait for EventData in event_data.rs:

```rust
use rand::distributions::{Distribution, Standard};
use rand::Rng;
use serde::Serialize;
use strum::EnumCount;
use strum_macros::{EnumCount as EnumCountMacro, EnumIter};

#[derive(Debug, EnumCountMacro, EnumIter, Serialize)]
pub enum EventType {
    SensorTriggered,
    SensorAcknowledged,
    SensorOff,
}

#[derive(Debug, Serialize)]
pub struct EventData {
    pub event_type: EventType,
    pub timestamp: u64,
    pub correlation_id: u64,
}

impl Distribution<EventData> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> EventData {
        let (timestamp, correlation_id) = rng.gen();
        let event_type = match rng.gen_range(0..=(EventType::COUNT - 1)) {
            0 => EventType::SensorAcknowledged,
            1 => EventType::SensorTriggered,
            _ => EventType::SensorOff,
        };
        EventData {
            event_type,
            timestamp,
            correlation_id,
        }
    }
}
```

This implementation uses the gen() method from the Rng trait to generate a random timestamp and correlation ID for the event. It then generates a random EventType by generating a random integer between 0 and the number of variants in the EventType enum, and matching on the result to select one of the possible EventType variants.

What’s interesting here is that we have defined our own custom datatype and told Rust how it should generate random events of that type. Then when we come to actually generate the data, Rust will use the definition we’ve given above for Distribution<EventData>.

## Writing the Generated Data to CSV

Now that we can generate random EventData instances, we need to write them to a CSV file. We'll do this in main.rs using the csv crate. Here's our implementation:

```rust
use csv::Writer;
use event_data::EventData;
use rand::Rng;
use std::error::Error;
use std::fs::File;
use std::time::Instant;
mod event_data;

fn write_event_to_csv(wtr: &mut Writer<File>, event_data: EventData) -> Result<(), Box<dyn Error>> {
    wtr.serialize(&event_data)?;
    wtr.flush()?;
    Ok(())
}

fn main() {
    let total_events = 10000;
    let mut rng = rand::thread_rng();
    let mut wtr = Writer::from_path("random_data.csv").unwrap();

    let now = Instant::now();

    for _ in 0..total_events {
        let random_event: EventData = rng.gen();

        write_event_to_csv(&mut wtr, random_event).unwrap();
    }

    println!("Finished in {:?}!", now.elapsed());
}
```

We start by defining a helper function called write_event_to_csv that takes a reference to a CSV writer and an EventData instance, and writes the event data to the CSV. We use the serialize method of the Writer to write the EventData instance as a row in the CSV file. We then call the flush method to ensure that the data is written to disk.

In main, we create a Writer instance that writes to a file called random_data.csv. We then generate a total of 10,000 random EventData instances using the gen() method from the Rng trait, and write each instance to the CSV file using our write_event_to_csv function.

## Conclusion

In this article, we’ve seen how to use Rust’s rand crate to generate random data and write it to a CSV file. We've defined a custom data type, implemented the Distribution trait for it, and used the csv crate to write the generated data to disk. By leveraging Rust's strong typing and expressive syntax, we've created a robust and reliable system for generating and writing random data for custom datatypes.
