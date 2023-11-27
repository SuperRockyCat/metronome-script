#!/bin/bash

API_URL="https://api.metronome.com/v1/ingest"
BEARER_TOKEN="<API TOKEN HERE>"

CUSTOMER_IDS=("rocky@rocky.com" "acme@acme.com" "evil@evilcorp.com")

while true; do
  # Create an array to store customer data objects
  CUSTOMER_DATA=()

  for CUSTOMER_ID in "${CUSTOMER_IDS[@]}"; do
    # Generate unique transaction ID
    TRANSACTION_ID=$(uuidgen)

    # Generate dynamic timestamp in RFC 3339 format
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S%:z")

    # Determine provider with a 50/50 chance
    if (( RANDOM % 2 == 0 )); then
      PROVIDER="aws"
    else
      PROVIDER="gcp"
    fi

    # Create customer data object and add it to the array
    CUSTOMER_DATA+=('{
      "transaction_id": "'"$TRANSACTION_ID"'",
      "customer_id": "'"$CUSTOMER_ID"'",
      "event_type": "heartbeat",
      "timestamp": "'"$TIMESTAMP"'",
      "properties": {
        "cluster_id": "42",
        "cpu_seconds": 60,
        "region": "Europe",
        "provider": "'"$PROVIDER"'"
      }
    }, ')
  done

  # Combine customer data objects into a JSON array
  JSON_PAYLOAD="[${CUSTOMER_DATA[*]}]"

  # Log the heartbeat occurrences
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S%:z")
  echo "Heartbeat occurred at $TIMESTAMP for Customer IDs: ${CUSTOMER_IDS[*]}"

  # Make the POST request using curl
  curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $BEARER_TOKEN" -d "$JSON_PAYLOAD" "$API_URL"

  # Sleep for 1 minute before the next iteration
  sleep 60
done
