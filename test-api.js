const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing School Application API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Create a student
    console.log('\n2. Creating a student...');
    const studentData = {
      name: 'John Doe',
      email: 'john.doe@school.com',
      grade: 10,
      age: 16,
      parentPhone: '+1-555-123-4567'
    };

    const createResponse = await axios.post(`${BASE_URL}/api/students`, studentData);
    console.log('✅ Student created:', createResponse.data);
    const studentId = createResponse.data.data.id;

    // Test 3: Get all students
    console.log('\n3. Getting all students...');
    const listResponse = await axios.get(`${BASE_URL}/api/students`);
    console.log('✅ Students retrieved:', listResponse.data);

    // Test 4: Get specific student
    console.log('\n4. Getting specific student...');
    const getResponse = await axios.get(`${BASE_URL}/api/students/${studentId}`);
    console.log('✅ Student retrieved:', getResponse.data);

    // Test 5: Update student
    console.log('\n5. Updating student...');
    const updateData = {
      name: 'John Smith',
      email: 'john.smith@school.com',
      grade: 11,
      age: 17,
      parentPhone: '+1-555-123-4567'
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/students/${studentId}`, updateData);
    console.log('✅ Student updated:', updateResponse.data);

    // Test 6: Create more students for pagination test
    console.log('\n6. Creating more students for pagination test...');
    const students = [
      {
        name: 'Jane Smith',
        email: 'jane.smith@school.com',
        grade: 9,
        age: 15,
        parentPhone: '+1-555-234-5678'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@school.com',
        grade: 12,
        age: 18,
        parentPhone: '+1-555-345-6789'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@school.com',
        grade: 10,
        age: 16,
        parentPhone: '+1-555-456-7890'
      }
    ];

    for (const student of students) {
      await axios.post(`${BASE_URL}/api/students`, student);
    }
    console.log('✅ Additional students created');

    // Test 7: Test pagination
    console.log('\n7. Testing pagination...');
    const paginatedResponse = await axios.get(`${BASE_URL}/api/students?page=1&limit=2`);
    console.log('✅ Pagination test:', paginatedResponse.data);

    // Test 8: Test search
    console.log('\n8. Testing search...');
    const searchResponse = await axios.get(`${BASE_URL}/api/students?search=john`);
    console.log('✅ Search test:', searchResponse.data);

    // Test 9: Test grade filter
    console.log('\n9. Testing grade filter...');
    const gradeResponse = await axios.get(`${BASE_URL}/api/students?grade=10`);
    console.log('✅ Grade filter test:', gradeResponse.data);

    // Test 10: View logs
    console.log('\n10. Viewing recent logs...');
    const logsResponse = await axios.get(`${BASE_URL}/logs?size=5`);
    console.log('✅ Recent logs:', logsResponse.data);

    // Test 11: Test error handling (invalid student ID)
    console.log('\n11. Testing error handling...');
    try {
      await axios.get(`${BASE_URL}/api/students/invalid-id`);
    } catch (error) {
      console.log('✅ Error handling test passed:', error.response.data);
    }

    // Test 12: Test validation error
    console.log('\n12. Testing validation error...');
    try {
      await axios.post(`${BASE_URL}/api/students`, {
        name: 'Test',
        email: 'invalid-email',
        grade: 15, // Invalid grade
        age: 3, // Invalid age
        parentPhone: 'invalid-phone'
      });
    } catch (error) {
      console.log('✅ Validation error test passed:', error.response.data);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Check OpenSearch Dashboards at: http://localhost:5601');
    console.log('📝 View logs at: http://localhost:3000/logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPI(); 