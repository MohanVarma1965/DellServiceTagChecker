import axios from "axios";

export const getExpiryDate = async (serviceTag) => {
  try {
    const { data } = await axios.get(`http://localhost:3001/api/expiry-date/${serviceTag}`);
    return data;
  } catch (error) {
    console.error("Error fetching expiry date from server:", error);
    return { serviceTag, expiryDate: "Not found" };
  }
};

export const getExpiryDatesForTags = async (serviceTags) => {
  const requests = serviceTags.map((tag) => getExpiryDate(tag));
  return Promise.all(requests);
};
