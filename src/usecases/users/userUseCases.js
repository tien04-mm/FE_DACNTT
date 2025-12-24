import { getUserRepository } from '../../domain/repositories/RepositoryFactory';
import { User } from '../../domain/models/User';

const userRepository = getUserRepository();

export const createUserUseCase = async (userData) => {
    const requiredFields = ['username', 'password', 'email', 'fullName', 'role'];
    for (const field of requiredFields) {
        if (!userData[field]) {
            throw new Error(`${field} không được để trống`);
        }
    }

    // [FIX]: Thêm 'SECRETARY' vào danh sách role hợp lệ
    const validRoles = ['ADMIN', 'LECTURER', 'STUDENT', 'SECRETARY'];
    
    if (!validRoles.includes(userData.role)) {
        throw new Error('Role không hợp lệ');
    }

    if (userData.role === 'LECTURER' && !userData.lecturerCode) {
        throw new Error('Mã giảng viên không được để trống');
    }

    if (userData.role === 'STUDENT' && !userData.studentCode) {
        throw new Error('Mã sinh viên không được để trống');
    }

    const response = await userRepository.createUser(userData);
    return User.fromApi(response);
};

export const getUsersUseCase = async (params = {}) => {
    const response = await userRepository.getUsers(params);
    const content = response.content || response.data || response;
    const users = Array.isArray(content)
        ? content.map(u => User.fromApi(u))
        : [];

    return {
        users,
        total: response.totalElements || users.length,
        page: response.number || 0,
        totalPages: response.totalPages || 1,
    };
};

export const getUserByIdUseCase = async (userId) => {
    if (!userId) {
        throw new Error('ID người dùng không được để trống');
    }

    const response = await userRepository.getUserById(userId);
    return User.fromApi(response);
};

export const updateUserUseCase = async (userId, userData) => {
    if (!userId) {
        throw new Error('ID người dùng không được để trống');
    }

    const response = await userRepository.updateUser(userId, userData);
    return User.fromApi(response);
};

export const deleteUserUseCase = async (userId) => {
    if (!userId) {
        throw new Error('ID người dùng không được để trống');
    }

    await userRepository.deleteUser(userId);
};

export const resetPasswordUseCase = async (username) => {
    if (!username) {
        throw new Error('Tên đăng nhập không được để trống');
    }

    const response = await userRepository.resetPassword(username);
    return response;
};

/**
 * Get Current User Info Use Case
 * Calls /me endpoint to get fresh user data
 * @returns {Promise<User>}
 */
export const getMeUseCase = async () => {
    // Gọi xuống Repository để lấy dữ liệu từ API /me
    const response = await userRepository.getMe();
    return User.fromApi(response);
};

const userUseCases = {
    createUser: createUserUseCase,
    getUsers: getUsersUseCase,
    getUserById: getUserByIdUseCase,
    updateUser: updateUserUseCase,
    deleteUser: deleteUserUseCase,
    resetPassword: resetPasswordUseCase,
    getMe: getMeUseCase,
};

export default userUseCases;