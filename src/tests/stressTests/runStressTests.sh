n=5  # Default value if not provided

# Function to kill Node.js processes
cleanup() {
    echo "Killing all Node.js processes..."
    kill -9 $(pgrep node)
}

# Set a trap to call the cleanup function on exit
trap cleanup EXIT

# Parse command-line arguments
while getopts ":n:" opt; do
  case ${opt} in
    n )
      n=$OPTARG
      ;;
    \? )
      echo "Usage: $0 [-n <number_of_runs>]"
      exit 1
      ;;
  esac
done

# Loop to run the test n times
for (( i=0; i<n; i++ )); do
    echo "Running test iteration: $i"
    npx jest src/tests/stressTests/mockUsers.test.js --runInBand -- "$i" &

done

wait
