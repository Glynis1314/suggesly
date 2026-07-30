import axiosInstance from './axiosInstance';

export const getNotes = async (entityType, entityId) => {
  const res = await axiosInstance.get('/notes', { params: { entityType, entityId } });
  return res.data?.data || [];
};

export const createNote = async ({ entityType, entityId, text, author }) => {
  const res = await axiosInstance.post('/notes', { entityType, entityId, text, author });
  return res.data?.data;
};

export const deleteNote = async (id) => {
  await axiosInstance.delete(`/notes/${id}`);
};
