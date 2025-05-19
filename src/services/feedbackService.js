export const submitFeedback = async (data) => {
  const response = await fetch('/.netlify/functions/submit-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
};
