#!/bin/bash

if [ "$#" -le 2 ]; then
  echo "$0: [-r] name_of_app name_of_env first_two_octets"
  echo "    [-r] optional, read config from existing json files and reprint eb CLI commands"
  echo "    name_of_app: Name to reference in Elasticbeanstalk of application, e.g. scratch-assets"
  echo "    name_of_env: Name to reference for environment, e.g. staging or production"
  echo "    first_two_octets: Start of a /16 network, e.g. 10.20"
  echo ""
  echo "  Provides setup and tagging for creating a VPC named after the app, assigned"
  echo "  three availability zones using the xx.xx.0.0/16 based on the first two"
  echo "  octets provided."
  echo "  json files are created and left in place to describe last configuration setups"
  exit -1
fi

if [ "$1" = "-r" ]; then
  reread="yes"
  shift
fi

global_name=$1
shift
environment_name=$1
shift
cidr_start=$1
shift

eb_setup_notice()
{
  echo "Run the following:"
  echo "  eb init scratch-assets # if not already initialized"
  echo "  when prompted, use the subnets: ${pub_subnet_1a},${pub_subnet_1c},${pub_subnet_1d}"
  echo "  eb create --cname ${global_name}-${environment_name} --scale 2 --elb-type application \\"
  echo "    --vpc --instance_type m3.medium \\"
  echo "    --envvars SESSION_SALT='..',SESSION_SECRET='..' ${global_name}-${environment_name}"
  echo ""
  echo "Don't bother trying to use the other --vpc.* options. They don't correctly setup"
  echo "  an application using the ALB and properly exposing the ALB and do not correctly"
  echo "  setup the right platform application web servers."
  echo "  Correct as of Jun 2017"
  echo " After the EB environment is created, be sure to add HTTPS and certificate to the"
  echo "  newly created ALB"
  echo " Assets uses an Application Load Balancer and ElasticBeanstalk does not correctly"
  echo "  handle setting up the health check. If you set the health check in the EB webgui"
  echo "  interface, ALB's ignore it! You must select the Target Group of the ALB, select"
  echo "  the Health Check tab and adjust the health check there."
  echo " Once the subnets ar created, you will need to modify"
  echo "  the EB's security role to allow access to the S3 bucket"
  echo " Make sure the EB CNAME is being used for the correct DNS entry."
  echo " Add HTTPS Listener to Load balancer for ALB, with correct cert"
  echo ""
  echo " Make sure you have SESSION_SALT and SESSION_SECRET properly set"
}

get_vpc() {
  echo `jq -r '.Vpc.VpcId' vpc.result.json`
}
get_igw() {
  echo `jq -r '.InternetGateway.InternetGatewayId' igw.json`
}
get_route_id() {
  echo `jq ".RouteTables[] | select(.VpcId==\"${1}\")" vpc-route-tables.json | jq -r '.RouteTableId'`
}
get_subnet() {
  echo `jq -r '.Subnet.SubnetId' ${1}-subnet-${2}.json`
}
get_sec_group() {
  echo `jq ".SecurityGroups[] | select(.VpcId==\"${1}\")" vpc-sec-group.json | jq 'select(.Description=="default VPC security group")'| jq -r '.GroupId'`
}

if [ "$reread" = "yes" ]; then
  new_vpc=$(get_vpc)
  pub_subnet_1a=$(get_subnet "pub" "1a")
  pub_subnet_1c=$(get_subnet "pub" "1c")
  pub_subnet_1d=$(get_subnet "pub" "1d")
  sec_group=$(get_sec_group "${new_vpc}")
  eb_setup_notice
  exit 0
fi

echo -n "Create VPC: "
## Create the VPC and name it
aws ec2 create-vpc --cidr-block ${cidr_start}.0.0/16 --amazon-provided-ipv6-cidr-block --instance-tenancy default > vpc.result.json
new_vpc=$(get_vpc)
aws ec2 create-tags --resources ${new_vpc} --tags Key=Name,Value=${global_name}-${environment_name}
echo "${new_vpc} ${global_name}-${environment_name}"

echo -n "Create gateway: "
## Setup internet gateway to vpc
aws ec2 create-internet-gateway > igw.json
new_igw=$(get_igw)
aws ec2 attach-internet-gateway --internet-gateway-id ${new_igw} --vpc-id ${new_vpc}
aws ec2 create-tags --resources ${new_igw} --tags Key=Name,Value=${global_name}-${environment_name}-igw
echo "${new_igw} ${global_name}-${environment_name}-igw"

aws ec2 describe-route-tables > vpc-route-tables.json
echo -n "Associate route table and create default route: "
route_id=$(get_route_id "${new_vpc}")
aws ec2 create-route --route-table-id ${route_id} --destination-cidr-block 0.0.0.0/0 --gateway-id ${new_igw} > route-to-gateway.json
echo "${route_id}"

echo "Create and assign subnets: "
echo -n "  Public: "
## Setup public networks and name them
aws ec2 create-subnet --vpc-id ${new_vpc} --cidr-block ${cidr_start}.1.0/24 --availability-zone us-east-1a > pub-subnet-1a.json
pub_subnet_1a=$(get_subnet "pub" "1a")
echo -n "${pub_subnet_1a} "
aws ec2 create-subnet --vpc-id ${new_vpc} --cidr-block ${cidr_start}.2.0/24 --availability-zone us-east-1c > pub-subnet-1c.json
pub_subnet_1c=$(get_subnet "pub" "1c")
echo -n "${pub_subnet_1c} "
aws ec2 create-subnet --vpc-id ${new_vpc} --cidr-block ${cidr_start}.3.0/24 --availability-zone us-east-1d > pub-subnet-1d.json
pub_subnet_1d=$(get_subnet "pub" "1d")
echo "${pub_subnet_1d}"

echo -n "   Tag subnets: "
for net in 1a 1c 1d
do
  this_subnet="pub_subnet_${net}"
  echo -n " ${this_subnet} "
  aws ec2 create-tags --resources ${!this_subnet} --tags Key=Name,Value=${global_name}-${environment_name}-pub-${net}
  aws ec2 associate-route-table --route-table-id ${route_id} --subnet-id ${!this_subnet} > route-association-pub-${net}.json
done

## Setup route table for subnets
aws ec2 create-route-table --vpc-id ${new_vpc} > vpc-route-table.json
route_id=`jq -r '.RouteTable.RouteTableId' vpc-route-table.json`
echo ""
echo "    tag route table ${route_id}: ${global_name}-${environment_name}-pub-rtb"
aws ec2 create-tags --resources ${route_id} --tags Key=Name,Value=${global_name}-${environment_name}-pub-rtb

environment_exists=`aws elasticbeanstalk describe-environments | jq -r ".Environments[] | (select(.EnvironmentName==\"${global_name}-${environment_name}\"))"`
if [ "${environment_exists}" = "" ]; then
aws elasticbeanstalk create-application --application-name ${global_name}
else
echo "Found application-environment: ${environment_name} "
fi

aws elasticbeanstalk create-environment --application-name ${global_name} --environment-name ${global_name}-${environment_name} --solution-stack-name nodejs

aws ec2 describe-security-groups > vpc-sec-group.json
sec_group=$(get_sec_group "${new_vpc}")

eb_setup_notice

