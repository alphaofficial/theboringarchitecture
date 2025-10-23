export const createAuthTestHelper = () => {
	return {
		signupUser: async (email: string, name: string) => {
			// Mock auth helper for testing
			return {
				id: `user-${Date.now()}`,
				email,
				name,
				token: "mock-token",
			};
		},
		loginUser: async (email: string) => {
			// Mock login helper for testing
			return {
				token: "mock-token",
			};
		},
	};
};

export const createBusinessTestHelper = () => {
	return {
		createBusiness: async (ownerId: string, businessName: string) => {
			// Mock business helper for testing
			return {
				id: `business-${Date.now()}`,
				name: businessName,
				ownerId,
			};
		},
	};
};

export const createBookingTestHelper = () => {
	return {
		createBooking: async (businessId: string, customerId: string) => {
			// Mock booking helper for testing
			return {
				id: `booking-${Date.now()}`,
				businessId,
				customerId,
			};
		},
	};
};
